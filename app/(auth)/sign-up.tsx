import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, Image, ActivityIndicator, Alert,
} from "react-native";
import { useState } from "react";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { FONTS } from "../constants/fonts";
import { posthog } from "@/lib/postHog";

const C = {
  bg: "#F6F8FC",
  card: "#FFFFFF",
  border: "#E4ECF8",

  accent: "#4D97FF",
  success: "#31C48D",

  muted: "#7B8CA8",
  textDark: "#23395D",

  white: "#FFFFFF",

  softBlue: "#5AA7FF",

  error: "#E74C3C",
  dim: "#D6E2F3",

  weak: "#E74C3C",
  fair: "#F39C12",
  strong: "#31C48D",
};

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: error ? 4 : 18 }}>
      <Text style={fStyles.label}>{label}</Text>
      {children}
      {!!error && (
        <View style={fStyles.errRow}>
          <MaterialIcons name="error-outline" size={13} color={C.error} />
          <Text style={fStyles.errTxt}>{error}</Text>
        </View>
      )}
    </View>
  );
}
const fStyles = StyleSheet.create({
  label: { fontFamily: FONTS.semibold, fontSize: 13, color: C.textDark, marginBottom: 7 },
  errRow: { flexDirection: "row", alignItems: "center", marginTop: 5, gap: 4 },
  errTxt: { fontFamily: FONTS.regular, fontSize: 12, color: C.error },
});

// ─── Password field with eye toggle ──────────────────────────────────────────
function PasswordField({
  value, onChange, placeholder = "Password", hasError,
}: { value: string; onChange: (t: string) => void; placeholder?: string; hasError?: boolean }) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={[pfStyles.row, hasError && pfStyles.rowErr]}>
      <Feather name="lock" size={17} color={C.muted} style={{ marginRight: 10 }} />
      <TextInput
        style={pfStyles.input}
        placeholder={placeholder}
        placeholderTextColor={C.muted}
        secureTextEntry={!visible}
        value={value}
        onChangeText={onChange}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TouchableOpacity
        onPress={() => setVisible(v => !v)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Feather name={visible ? "eye" : "eye-off"} size={18} color={C.muted} />
      </TouchableOpacity>
    </View>
  );
}
const pfStyles = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center", backgroundColor: C.card,
    borderWidth: 1.5, borderColor: C.border, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 13,
  },
  rowErr: { borderColor: C.error },
  input: { flex: 1, fontFamily: FONTS.regular, fontSize: 15, color: C.textDark },
});

// ─── Password strength ────────────────────────────────────────────────────────
type StrengthLevel = 0 | 1 | 2 | 3;

function getStrength(pw: string): { level: StrengthLevel; label: string; color: string } {
  if (!pw) return { level: 0, label: "", color: C.border };
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { level: 1, label: "Weak", color: C.weak };
  if (s === 2) return { level: 2, label: "Fair", color: C.fair };
  return { level: 3, label: "Strong", color: C.strong };
}

function StrengthBar({ password }: { password: string }) {
  const { level, label, color } = getStrength(password);
  if (!password) return null;
  return (
    <View style={sbStyles.row}>
      <View style={sbStyles.track}>
        {[1, 2, 3].map(i => (
          <View key={i} style={[sbStyles.seg, { backgroundColor: i <= level ? color : C.dim }]} />
        ))}
      </View>
      <Text style={[sbStyles.label, { color }]}>{label}</Text>
    </View>
  );
}

function StrengthRules({ password }: { password: string }) {
  if (!password) return null;
  const rules = [
    { ok: password.length >= 8,          text: "8+ characters" },
    { ok: /[A-Z]/.test(password),        text: "Uppercase letter" },
    { ok: /[0-9]/.test(password),        text: "Number" },
    { ok: /[^A-Za-z0-9]/.test(password), text: "Special character (!@#…)" },
  ];
  return (
    <View style={sbStyles.rulesGrid}>
      {rules.map(r => (
        <View key={r.text} style={sbStyles.ruleItem}>
          <Feather
            name={r.ok ? "check-circle" : "circle"}
            size={13}
            color={r.ok ? C.success : C.dim}
          />
          <Text style={[sbStyles.ruleTxt, { color: r.ok ? C.success : C.muted }]}>{r.text}</Text>
        </View>
      ))}
    </View>
  );
}

const sbStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", marginTop: 8, marginBottom: 6 },
  track: { flex: 1, flexDirection: "row", gap: 5 },
  seg: { flex: 1, height: 5, borderRadius: 3 },
  label: { fontFamily: FONTS.semibold, fontSize: 12, marginLeft: 10, minWidth: 44 },
  rulesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  ruleItem: { flexDirection: "row", alignItems: "center", gap: 5, width: "46%" },
  ruleTxt: { fontFamily: FONTS.regular, fontSize: 12 },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
const isStrongPw = (pw: string) =>
  pw.length >= 8 && /[A-Z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw);

// ─── Main SignUpScreen ────────────────────────────────────────────────────────
export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pwFocused, setPwFocused] = useState(false);

  const [emailErr, setEmailErr] = useState("");
  const [passErr, setPassErr] = useState("");
  const [confirmErr, setConfirmErr] = useState("");
  const [codeErr, setCodeErr] = useState("");

  const validate = () => {
    let ok = true;
    if (!isValidEmail(email)) { setEmailErr("Enter a valid email address."); ok = false; } else setEmailErr("");
    if (!isStrongPw(password)) { setPassErr("Your password doesn't meet all requirements."); ok = false; } else setPassErr("");
    if (password !== confirmPw) { setConfirmErr("Passwords don't match."); ok = false; } else setConfirmErr("");
    return ok;
  };

  const onSignUp = async () => {
    if (!isLoaded || !validate()) return;
    setLoading(true);
    try {
      await signUp!.create({ emailAddress: email.trim(), password });
      await signUp!.prepareEmailAddressVerification({ strategy: "email_code" });
      setPending(true);
    } catch (err: any) {
      const msg: string = err.errors?.[0]?.message ?? "Sign up failed";

      posthog.capture("sign_up_failed", { error: msg });

      if (msg.toLowerCase().includes("email")) setEmailErr(msg);
      else setPassErr(msg);
    } finally { setLoading(false); }
  };

  const onVerify = async () => {
    if (!isLoaded) return;
    if (code.length < 6) { setCodeErr("Enter the full 6-digit code."); return; }
    setLoading(true);
    try {
      const result = await signUp!.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await setActive!({ session: result.createdSessionId });

        posthog.identify(result.createdSessionId ?? email.trim(), {
          email: email.trim(),
        });
        posthog.capture("sign_up_completed", {
          email: email.trim(),
          method: "email",
        });
        await posthog.flush();

        router.replace("/(tabs)");
      } else {
        setCodeErr("Verification incomplete. Try again.");
      }
    } catch (err: any) {
      setCodeErr(err.errors?.[0]?.message ?? "Invalid code.");
    } finally { setLoading(false); }
  };

  const resendCode = async () => {
    try {
      await signUp!.prepareEmailAddressVerification({ strategy: "email_code" });
      Alert.alert("Code resent", "Check your inbox.");
    } catch (err: any) {
      Alert.alert("Error", err.errors?.[0]?.message ?? "Could not resend.");
    }
  };

  if (pending) {
    return (
      <KeyboardAvoidingView style={s.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <View style={s.container}>
            <Image source={require("@/assets/images/monetize_logo.png")} style={s.logo} resizeMode="contain" />

            <View style={s.otpIconWrap}>
              <Feather name="inbox" size={32} color={C.accent} />
            </View>
            <Text style={s.title}>Check your inbox</Text>
            <Text style={s.subtitle}>
              We sent a 6-digit code to{"\n"}
              <Text style={{ color: C.accent, fontFamily: FONTS.semibold }}>{email}</Text>
            </Text>

            <Field label="Verification code" error={codeErr}>
              <View style={[pfStyles.row, !!codeErr && pfStyles.rowErr, { justifyContent: "center" }]}>
                <Feather name="hash" size={17} color={C.muted} style={{ marginRight: 10 }} />
                <TextInput
                  style={[pfStyles.input, { letterSpacing: 10, fontSize: 22, fontFamily: FONTS.bold, textAlign: "center" }]}
                  placeholder="• • • • • •"
                  placeholderTextColor={C.dim}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={code}
                  onChangeText={t => { setCode(t); setCodeErr(""); }}
                />
              </View>
            </Field>

            <TouchableOpacity
              style={[s.btn, loading && { opacity: 0.65 }]}
              onPress={onVerify}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : (
                  <View style={s.btnInner}>
                    <Text style={s.btnTxt}>Verify email</Text>
                    <Feather name="arrow-right" size={18} color="#fff" />
                  </View>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={resendCode} style={s.linkWrap}>
              <Feather name="refresh-cw" size={14} color={C.accent} />
              <Text style={s.linkTxt}>Resend code</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { setPending(false); setCode(""); setCodeErr(""); }}
              style={[s.linkWrap, { marginTop: 8 }]}
            >
              <Feather name="arrow-left" size={14} color={C.muted} />
              <Text style={[s.linkTxt, { color: C.muted }]}>Change email address</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ── Registration screen ──────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.container}>

          
          <Image source={require("@/assets/images/monetize_logo.png")} style={s.logo} resizeMode="contain" />
          <Text style={s.title}>Create account</Text>
          <Text style={s.subtitle}>Start tracking your subscriptions</Text>

          {/* Email */}
          <Field label="Email" error={emailErr}>
            <View style={[pfStyles.row, !!emailErr && pfStyles.rowErr]}>
              <Feather name="mail" size={17} color={C.muted} style={{ marginRight: 10 }} />
              <TextInput
                style={pfStyles.input}
                placeholder="you@example.com"
                placeholderTextColor={C.muted}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={t => { setEmail(t); setEmailErr(""); }}
              />
            </View>
          </Field>

          {/* Password */}
          <View style={{ marginBottom: passErr ? 4 : 0 }}>
            <Text style={fStyles.label}>Password</Text>
            <PasswordField
              value={password}
              hasError={!!passErr}
              onChange={t => { setPassword(t); setPassErr(""); setPwFocused(true); }}
            />
            <StrengthBar password={password} />
            {(pwFocused || !!password) && <StrengthRules password={password} />}
            {!!passErr && (
              <View style={[fStyles.errRow, { marginBottom: 14 }]}>
                <MaterialIcons name="error-outline" size={13} color={C.error} />
                <Text style={fStyles.errTxt}>{passErr}</Text>
              </View>
            )}
          </View>

          {/* Confirm password */}
          <Field label="Confirm password" error={confirmErr}>
            <PasswordField
              value={confirmPw}
              placeholder="Re-enter password"
              hasError={!!confirmErr}
              onChange={t => { setConfirmPw(t); setConfirmErr(""); }}
            />
          </Field>

          {/* Match indicator */}
          {!!confirmPw && (
            <View style={[s.matchRow, { marginTop: -10, marginBottom: 14 }]}>
              <Feather
                name={password === confirmPw ? "check-circle" : "x-circle"}
                size={14}
                color={password === confirmPw ? C.success : C.error}
              />
              <Text style={[s.matchTxt, { color: password === confirmPw ? C.success : C.error }]}>
                {password === confirmPw ? "Passwords match" : "Passwords don't match"}
              </Text>
            </View>
          )}

          {/* Create button */}
          <TouchableOpacity
            style={[s.btn, loading && { opacity: 0.65 }]}
            onPress={onSignUp}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : (
                <View style={s.btnInner}>
                  <Text style={s.btnTxt}>Create Account</Text>
                  <Feather name="arrow-right" size={18} color="#fff" />
                </View>
              )}
          </TouchableOpacity>

          {/* Footer */}
          <View style={s.footer}>
            <Text style={s.footerTxt}>Already have an account? </Text>
            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity>
                <Text style={[s.footerTxt, { color: C.accent, fontFamily: FONTS.semibold }]}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { flexGrow: 1 },
  container: { flex: 1, justifyContent: "center", paddingHorizontal: 26, paddingVertical: 48 },
  logo: { width: 90, height: 90, marginBottom: 24,borderRadius:25 },
  title: { fontFamily: FONTS.bold, fontSize: 30, color: C.textDark, marginBottom: 6 },
  subtitle: { fontFamily: FONTS.regular, fontSize: 15, color: C.muted, marginBottom: 28, lineHeight: 22 },
  btn: {
    backgroundColor: C.accent, borderRadius: 14,
    paddingVertical: 16, alignItems: "center", marginTop: 6,
  },
  btnInner: { flexDirection: "row", alignItems: "center", gap: 8 },
  btnTxt: { fontFamily: FONTS.semibold, fontSize: 16, color: "#fff" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 26 },
  footerTxt: { fontFamily: FONTS.regular, fontSize: 14, color: C.muted },
  matchRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  matchTxt: { fontFamily: FONTS.regular, fontSize: 12 },
  otpIconWrap: {
    width: 68, height: 68, borderRadius: 20, backgroundColor: "#FAE9D9",
    justifyContent: "center", alignItems: "center", marginBottom: 20,
  },
  linkWrap: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 16 },
  linkTxt: { fontFamily: FONTS.semibold, fontSize: 14, color: C.accent },
});