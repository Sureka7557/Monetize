import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import your data
import {
  UPCOMING_SUBSCRIPTIONS,
} from '../constants/data';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  background: "#F6F8FC",
  card: "#FFFFFF",
  cardBorder: "#E4ECF8",

  accent: "#4D97FF",
  accentGreen: "#31C48D",

  muted: "#7B8CA8",
  textDark: "#23395D",

  white: "#FFFFFF",

  accentBlue: "#7CB8FF",     
  accentYellow: "#FFD166",
  accentTeal: "#5ECFA0",

  navBg: "#5AA7FF",         
};

// ─── Types ────────────────────────────────────────────────────────────────

interface DateRange {
  label: string;
  days: number;
}

interface DailyMetric {
  day: string;
  signups: number;
  signins: number;
  total: number;
}

interface InsightsState {
  dailyMetrics: DailyMetric[];
  totalSignups: number;
  totalSignins: number;
  monthlySpend: number;
  isLoading: boolean;
  error: string | null;
}

// ─── PostHog API ──────────────────────────────────────────────────────────

// Use EXPO_PUBLIC_ prefix so the value is available in the Expo bundle
const API_KEY = process.env.EXPO_PUBLIC_POSTHOG_PERSONAL_API_KEY;
const API_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://us.posthog.com';

// PostHog project ID — update this to match your project
const PROJECT_ID = '474331';

interface PostHogEvent {
  event: string;
  timestamp: string;
  properties?: Record<string, any>;
}

interface PostHogEventsResponse {
  results?: PostHogEvent[];
  next?: string | null;
}

/**
 * Fetches events of a given type from PostHog for the last `dateRange.days` days.
 * Returns the raw results array (may be empty on error).
 */
const fetchPostHogEvents = async (
  eventName: string,
  dateRange: DateRange
): Promise<PostHogEvent[]> => {
  if (!API_KEY) {
    console.warn('EXPO_PUBLIC_POSTHOG_PERSONAL_API_KEY is not set');
    return [];
  }

  const now = new Date();
  const past = new Date(now.getTime() - dateRange.days * 24 * 60 * 60 * 1000);

  const afterISO = past.toISOString();
  const beforeISO = now.toISOString();

  const url =
    `${API_HOST}/api/projects/${PROJECT_ID}/events/` +
    `?event=${encodeURIComponent(eventName)}` +
    `&after=${encodeURIComponent(afterISO)}` +
    `&before=${encodeURIComponent(beforeISO)}` +
    `&limit=1000`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`PostHog API error ${response.status}: ${body}`);
    }

    const data: PostHogEventsResponse = await response.json();
    return data.results ?? [];
  } catch (error) {
    console.error(`Failed to fetch PostHog event "${eventName}":`, error);
    return [];
  }
};

/**
 * Buckets a list of PostHog events into daily counts for the last 7 days.
 * Returns an array of { day, count } ordered oldest → newest.
 */
const bucketByDay = (
  events: PostHogEvent[],
  days: number
): { dateKey: string; dayLabel: string; count: number }[] => {
  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const buckets: Record<string, { dayLabel: string; count: number }> = {};

  // Build bucket keys for the last `days` days
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
    buckets[key] = { dayLabel: DAY_LABELS[d.getDay()], count: 0 };
  }

  // Count events into their buckets
  for (const ev of events) {
    const key = ev.timestamp.slice(0, 10);
    if (buckets[key]) {
      buckets[key].count += 1;
    }
  }

  return Object.entries(buckets).map(([dateKey, val]) => ({
    dateKey,
    dayLabel: val.dayLabel,
    count: val.count,
  }));
};

/**
 * Builds DailyMetric array by merging signup and signin buckets.
 */
const buildDailyMetrics = (
  signupEvents: PostHogEvent[],
  signinEvents: PostHogEvent[],
  dateRange: DateRange
): DailyMetric[] => {
  const signupBuckets = bucketByDay(signupEvents, dateRange.days);
  const signinBuckets = bucketByDay(signinEvents, dateRange.days);

  return signupBuckets.map((bucket, idx) => {
    const signups = bucket.count;
    const signins = signinBuckets[idx]?.count ?? 0;
    return {
      day: bucket.dayLabel,
      signups,
      signins,
      total: signups + signins,
    };
  });
};

// Calculate monthly spend from subscriptions
const calculateMonthlySpend = (): number => {
  return UPCOMING_SUBSCRIPTIONS.reduce((sum, sub) => sum + sub.price, 0);
};

// ─── Sub-components ───────────────────────────────────────────────────────

const UpcomingBar = ({ metric, isHighlight }: { metric: DailyMetric; isHighlight: boolean }) => {
  const maxValue = 80;
  const height = Math.max((metric.total / maxValue) * 120, 4); // at least 4px tall

  return (
    <View style={styles.barContainer}>
      <View
        style={[
          styles.bar,
          {
            height,
            backgroundColor: isHighlight ? COLORS.accentBlue : COLORS.textDark,
          },
        ]}
      />
      <Text style={styles.barLabel}>{metric.day}</Text>
    </View>
  );
};

const SubscriptionRow = ({ sub, isYellow }: { sub: typeof UPCOMING_SUBSCRIPTIONS[0]; isYellow: boolean }) => (
  <View style={[styles.subCard, { backgroundColor: isYellow ? '#FFF9E6' : '#E6F9F7' }]}>
    {sub.icon ? (
      <Image source={sub.icon} style={styles.subIcon} />
    ) : (
      <View style={[styles.subIconPlaceholder, { backgroundColor: isYellow ? '#FFB800' : '#4DB8A8' }]}>
        <Text style={styles.subInitial}>{sub.name.charAt(0)}</Text>
      </View>
    )}

    <View style={styles.subInfo}>
      <Text style={styles.subName}>{sub.name}</Text>
      <Text style={[styles.subDays, { color: isYellow ? '#FFB800' : '#4DB8A8' }]}>
        {sub.renewalDate}
      </Text>
    </View>

    <View style={styles.subCost}>
      <Text style={[styles.subPrice, { color: isYellow ? '#FFB800' : '#4DB8A8' }]}>
        ${sub.price.toFixed(2)}
      </Text>
      <Text style={styles.subFreq}>per month</Text>
    </View>
  </View>
);

const LoadingPlaceholder = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={COLORS.accent} />
    <Text style={styles.loadingText}>Loading insights...</Text>
  </View>
);

// ─── Main Component ───────────────────────────────────────────────────────

const Insights = () => {
  const [dateRange] = useState<DateRange>({ label: 'Last 7d', days: 7 });
  const [refreshing, setRefreshing] = useState(false);

  const [state, setState] = useState<InsightsState>({
    dailyMetrics: [],
    totalSignups: 0,
    totalSignins: 0,
    monthlySpend: calculateMonthlySpend(),
    isLoading: true,
    error: null,
  });

  const fetchInsights = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Fetch real PostHog event data for sign_up_completed and sign_in_completed
      const [signupEvents, signinEvents] = await Promise.all([
        fetchPostHogEvents('sign_up_completed', dateRange),
        fetchPostHogEvents('sign_in_completed', dateRange),
      ]);

      const dailyMetrics = buildDailyMetrics(signupEvents, signinEvents, dateRange);
      const totalSignups = dailyMetrics.reduce((sum, m) => sum + m.signups, 0);
      const totalSignins = dailyMetrics.reduce((sum, m) => sum + m.signins, 0);
      const monthlySpend = calculateMonthlySpend();

      setState({
        dailyMetrics,
        totalSignups,
        totalSignins,
        monthlySpend,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load insights';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      console.error('Error fetching insights:', error);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchInsights();
    setRefreshing(false);
  };

  const expenseTrend = -12;
  const currentMonth = 'March 2026';
  const highlightDay = 3; // Thursday is index 3

  if (state.isLoading && state.dailyMetrics.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <LoadingPlaceholder />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.accent} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Monthly Insights</Text>
        </View>

        {/* Error State */}
        {state.error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{state.error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Upcoming Section - Bar Chart */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chartSection}>
            <View style={styles.barChartContainer}>
              {state.dailyMetrics.map((metric, idx) => (
                <UpcomingBar key={metric.day} metric={metric} isHighlight={idx === highlightDay} />
              ))}
            </View>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.textDark }]} />
                <Text style={styles.legendText}>Signups: {state.totalSignups}</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.accentBlue }]} />
                <Text style={styles.legendText}>Signins: {state.totalSignins}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Expenses Section */}
        <View style={[styles.section, styles.expenseSection]}>
          <Text style={styles.sectionTitle}>Expenses</Text>
          <View style={styles.expenseContent}>
            <View>
              <Text style={styles.expenseAmount}>-${state.monthlySpend.toFixed(2)}</Text>
              <Text style={styles.expenseMonth}>{currentMonth}</Text>
            </View>
            <View style={[styles.trendBadge, expenseTrend < 0 && styles.trendDown]}>
              <Text style={styles.trendIcon}>↓</Text>
              <Text style={styles.trendText}>{Math.abs(expenseTrend)}%</Text>
            </View>
          </View>
        </View>

        {/* Subscriptions History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Subscriptions</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          {UPCOMING_SUBSCRIPTIONS.map((sub, idx) => (
            <SubscriptionRow key={sub.id} sub={sub} isYellow={idx === 0} />
          ))}
        </View>

        {/* Loading indicator during refresh */}
        {state.isLoading && (
          <View style={styles.refreshLoadingContainer}>
            <ActivityIndicator color={COLORS.accent} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Insights;

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  headerButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
  },

  // Error State
  errorContainer: {
    backgroundColor: '#FFF0F3',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accentBlue,
  },
  errorText: {
    color: COLORS.accentBlue,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: COLORS.accentBlue,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },

  // Section
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '500',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accent,
  },

  // Upcoming Chart Section
  chartSection: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 160,
    marginBottom: 16,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: '80%',
    borderRadius: 4,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.muted,
  },
  chartLegend: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.muted,
  },

  // Expense Section
  expenseSection: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  expenseContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  expenseAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  expenseMonth: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
    fontWeight: '500',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFE6E6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  trendDown: {
    backgroundColor: '#FFE6E6',
  },
  trendIcon: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.accentBlue,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.accentBlue,
  },

  // Subscription Card
  subCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  subIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    marginRight: 12,
  },
  subIconPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  subInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  subInfo: {
    flex: 1,
  },
  subName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 2,
  },
  subDays: {
    fontSize: 11,
    fontWeight: '500',
  },
  subCost: {
    alignItems: 'flex-end',
  },
  subPrice: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  subFreq: {
    fontSize: 10,
    color: COLORS.muted,
    fontWeight: '500',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.muted,
    fontWeight: '500',
  },
  refreshLoadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },

  // Bottom Navigation
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: COLORS.navBg,
    paddingBottom: 20,
    paddingTop: 12,
    justifyContent: 'space-around',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  navItem: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
    height: 44,
  },
  navIcon: {
    fontSize: 22,
  },
});