import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, Image, ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { FONTS } from "../constants/fonts";
import { usePostHog } from "posthog-react-native";
const C = {
  bg: "#F2DEC7", card: "#FFFFFF", border: "#E1B8A2",
  accent: "#CF7D65", muted: "#ABA66F", textDark: "#4A3728",
  error: "#C0392B", success: "#5A9A6A", dim: "#D4B99A",
};

// ─── Reusable field wrapper ──────────────────────────────────────────────────
function Field({
  label, error, children,
}: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: error ? 6 : 18 }}>
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

// ─── Password input with eye toggle ─────────────────────────────────────────
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

// ─── Forgot password overlay ─────────────────────────────────────────────────
type FPStep = "email" | "code" | "newpw" | "done";

function ForgotPasswordOverlay({ onClose }: { onClose: () => void }) {
  const { signIn, isLoaded } = useSignIn();
  const [step, setStep] = useState<FPStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPw, setNewPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const sendCode = async () => {
    if (!isLoaded || !email.trim()) { setErr("Please enter your email."); return; }
    setLoading(true); setErr("");
    try {
      await signIn!.create({ strategy: "reset_password_email_code", identifier: email.trim() });
      setStep("code");
    } catch (e: any) { setErr(e.errors?.[0]?.message ?? "Failed to send code."); }
    finally { setLoading(false); }
  };

  const verifyCode = async () => {
    if (code.length < 6) { setErr("Enter the full 6-digit code."); return; }
    setLoading(true); setErr("");
    try {
      const res = await signIn!.attemptFirstFactor({ strategy: "reset_password_email_code", code });
      if (res.status === "needs_new_password") setStep("newpw");
      else setErr("Unexpected response. Try again.");
    } catch (e: any) { setErr(e.errors?.[0]?.message ?? "Invalid code."); }
    finally { setLoading(false); }
  };

  const resetPw = async () => {
    if (newPw.length < 8) { setErr("Password must be at least 8 characters."); return; }
    setLoading(true); setErr("");
    try {
      await signIn!.resetPassword({ password: newPw });
      setStep("done");
    } catch (e: any) { setErr(e.errors?.[0]?.message ?? "Reset failed."); }
    finally { setLoading(false); }
  };

  const stepMeta: Record<FPStep, { icon: string; title: string; sub: string }> = {
    email: { icon: "mail", title: "Forgot password?", sub: "Enter your email and we'll send a reset code." },
    code:  { icon: "inbox", title: "Check your email", sub: `We sent a 6-digit code to ${email}` },
    newpw: { icon: "lock", title: "New password", sub: "Choose something strong you haven't used before." },
    done:  { icon: "check-circle", title: "Password updated!", sub: "You can now sign in with your new password." },
  };
  const meta = stepMeta[step];

  return (
    <View style={fpStyles.overlay}>
      <View style={fpStyles.sheet}>
        {/* Header */}
        <View style={fpStyles.headerRow}>
          <View style={fpStyles.iconCircle}>
            <Feather name={meta.icon as any} size={22} color={C.accent} />
          </View>
          <TouchableOpacity onPress={onClose} style={fpStyles.closeBtn}>
            <Feather name="x" size={20} color={C.muted} />
          </TouchableOpacity>
        </View>

        <Text style={fpStyles.title}>{meta.title}</Text>
        <Text style={fpStyles.sub}>{meta.sub}</Text>

        {/* Email step */}
        {step === "email" && (
          <>
            <View style={[pfStyles.row, { marginBottom: 6 }]}>
              <Feather name="mail" size={17} color={C.muted} style={{ marginRight: 10 }} />
              <TextInput
                style={pfStyles.input} placeholder="you@example.com"
                placeholderTextColor={C.muted} autoCapitalize="none"
                keyboardType="email-address" value={email}
                onChangeText={t => { setEmail(t); setErr(""); }}
              />
            </View>
            {!!err && <Text style={fpStyles.err}>{err}</Text>}
            <TouchableOpacity style={[fpStyles.btn, loading && { opacity: 0.6 }]} onPress={sendCode} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={fpStyles.btnTxt}>Send reset code</Text>}
            </TouchableOpacity>
          </>
        )}

        {/* Code step */}
        {step === "code" && (
          <>
            <TextInput
              style={fpStyles.otpInput} placeholder="123456"
              placeholderTextColor={C.dim} keyboardType="number-pad"
              maxLength={6} value={code}
              onChangeText={t => { setCode(t); setErr(""); }}
            />
            {!!err && <Text style={fpStyles.err}>{err}</Text>}
            <TouchableOpacity style={[fpStyles.btn, loading && { opacity: 0.6 }]} onPress={verifyCode} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={fpStyles.btnTxt}>Verify code</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={sendCode} style={fpStyles.link}>
              <Text style={fpStyles.linkTxt}>Resend code</Text>
            </TouchableOpacity>
          </>
        )}

        {/* New password step */}
        {step === "newpw" && (
          <>
            <PasswordField value={newPw} onChange={t => { setNewPw(t); setErr(""); }} placeholder="New password" />
            {!!err && <Text style={fpStyles.err}>{err}</Text>}
            <TouchableOpacity style={[fpStyles.btn, loading && { opacity: 0.6 }]} onPress={resetPw} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={fpStyles.btnTxt}>Set new password</Text>}
            </TouchableOpacity>
          </>
        )}

        {/* Done step */}
        {step === "done" && (
          <TouchableOpacity style={fpStyles.btn} onPress={onClose}>
            <Text style={fpStyles.btnTxt}>Back to sign in</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const fpStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(74,55,40,0.6)",
    justifyContent: "flex-end", zIndex: 99,
  },
  sheet: {
    backgroundColor: C.card, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 28, paddingBottom: 40,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  iconCircle: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: "#F2DEC7", justifyContent: "center", alignItems: "center",
  },
  closeBtn: { padding: 4 },
  title: { fontFamily: FONTS.bold, fontSize: 22, color: C.textDark, marginBottom: 6 },
  sub: { fontFamily: FONTS.regular, fontSize: 14, color: C.muted, marginBottom: 22, lineHeight: 21 },
  otpInput: {
    backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border, borderRadius: 14,
    paddingVertical: 16, paddingHorizontal: 20, fontFamily: FONTS.bold,
    fontSize: 22, letterSpacing: 10, color: C.textDark, textAlign: "center", marginBottom: 6,
  },
  btn: {
    backgroundColor: C.accent, borderRadius: 14,
    paddingVertical: 15, alignItems: "center", marginTop: 8,
  },
  btnTxt: { fontFamily: FONTS.semibold, fontSize: 16, color: "#fff" },
  err: { fontFamily: FONTS.regular, fontSize: 13, color: C.error, marginBottom: 8 },
  link: { alignItems: "center", marginTop: 14 },
  linkTxt: { fontFamily: FONTS.semibold, fontSize: 14, color: C.accent },
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [emailErr, setEmailErr] = useState("");
  const [passErr, setPassErr] = useState("");
  const [globalErr, setGlobalErr] = useState("");

  const validate = () => {
    let ok = true;
    if (!isValidEmail(email)) { setEmailErr("Enter a valid email address."); ok = false; } else setEmailErr("");
    if (!password) { setPassErr("Password is required."); ok = false; } else setPassErr("");
    return ok;
  };

  const onSignIn = async () => {
    if (!isLoaded || !validate()) return;
    setLoading(true); setGlobalErr("");
    try {
      const result = await signIn!.create({ identifier: email.trim(), password });
      if (result.status === "complete") {
        await setActive!({ session: result.createdSessionId });
        router.replace("/(tabs)");
      } else {
        setGlobalErr("Additional verification required.");
      }
    } catch (err: any) {
      const msg: string = err.errors?.[0]?.message ?? "Sign in failed";
      if (msg.toLowerCase().includes("password")) setPassErr(msg);
      else if (msg.toLowerCase().includes("email") || msg.toLowerCase().includes("identifier")) setEmailErr(msg);
      else setGlobalErr(msg);
    } finally { setLoading(false); }
  };

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView style={s.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <View style={s.container}>

            {/* Logo */}
            <Image source={require("@/assets/images/monetize.png")} style={s.logo} resizeMode="contain" />

            <Text style={s.title}>Welcome back</Text>
            <Text style={s.subtitle}>Sign in to your account</Text>

            {/* Global error */}
            {!!globalErr && (
              <View style={s.globalErr}>
                <MaterialIcons name="error-outline" size={15} color={C.error} />
                <Text style={s.globalErrTxt}>{globalErr}</Text>
              </View>
            )}

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
            <View style={{ marginBottom: 6 }}>
              <View style={s.pwLabelRow}>
                <Text style={fStyles.label}>Password</Text>
                <TouchableOpacity onPress={() => setShowForgot(true)}>
                  <Text style={s.forgotLink}>Forgot password?</Text>
                </TouchableOpacity>
              </View>
              <PasswordField value={password} onChange={t => { setPassword(t); setPassErr(""); }} hasError={!!passErr} />
              {!!passErr && (
                <View style={fStyles.errRow}>
                  <MaterialIcons name="error-outline" size={13} color={C.error} />
                  <Text style={fStyles.errTxt}>{passErr}</Text>
                </View>
              )}
            </View>

            {/* Sign in button */}
            <TouchableOpacity
              style={[s.btn, loading && { opacity: 0.65 }]}
              onPress={onSignIn}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : (
                  <View style={s.btnInner}>
                    <Text style={s.btnTxt}>Sign In</Text>
                    <Feather name="arrow-right" size={18} color="#fff" />
                  </View>
                )}
            </TouchableOpacity>

            {/* Footer */}
            <View style={s.footer}>
              <Text style={s.footerTxt}>Don't have an account? </Text>
              <Link href="/(auth)/sign-up" asChild>
                <TouchableOpacity>
                  <Text style={[s.footerTxt, { color: C.accent, fontFamily: FONTS.semibold }]}>Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {showForgot && <ForgotPasswordOverlay onClose={() => setShowForgot(false)} />}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { flexGrow: 1 },
  container: { flex: 1, justifyContent: "center", paddingHorizontal: 26, paddingVertical: 48 },
  logo: { width: 90, height: 90, marginBottom: 28,borderRadius:25 },
  title: { fontFamily: FONTS.bold, fontSize: 30, color: C.textDark, marginBottom: 6 },
  subtitle: { fontFamily: FONTS.regular, fontSize: 15, color: C.muted, marginBottom: 30 },
  globalErr: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#FDECEA", borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, marginBottom: 18,
  },
  globalErrTxt: { fontFamily: FONTS.regular, fontSize: 13, color: C.error, flex: 1 },
  pwLabelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 7 },
  forgotLink: { fontFamily: FONTS.semibold, fontSize: 13, color: C.accent },
  btn: {
    backgroundColor: C.accent, borderRadius: 14,
    paddingVertical: 16, alignItems: "center", marginTop: 26,
  },
  btnInner: { flexDirection: "row", alignItems: "center", gap: 8 },
  btnTxt: { fontFamily: FONTS.semibold, fontSize: 16, color: "#fff" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 26 },
  footerTxt: { fontFamily: FONTS.regular, fontSize: 14, color: C.muted },
});