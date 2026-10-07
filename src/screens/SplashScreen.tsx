/**
 * Cinematic 7-second home screen for the Rayray app.
 *
 * Plays like a video ident: the Nailed It logo dollies in on a navy
 * backdrop, a shine sweeps across it, gold particles drift upward, and a
 * progress bar fills — then the Enter button appears and takes the
 * customer to the Services tab.
 */
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const LOGO = require("../../assets/nailed-it-logo.png");

const LOGO_SIZE = 280;
// The badge fills ~80% of the square image; oversize it inside a circular
// crop so no white corners show.
const IMG_SIZE = LOGO_SIZE / 0.8;
const IMG_OFFSET = -(IMG_SIZE - LOGO_SIZE) / 2;

const GOLD = "#f5a623";
const NAVY = "#0b2545";

function Particle({
  left,
  size,
  delay,
  duration,
  sway,
}: {
  left: number;
  size: number;
  delay: number;
  duration: number;
  sway: number;
}) {
  const y = useRef(new Animated.Value(0)).current;
  const x = useRef(new Animated.Value(0)).current;
  const o = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(y, {
              toValue: -300,
              duration,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(x, {
                toValue: sway,
                duration: duration / 2,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
              }),
              Animated.timing(x, {
                toValue: -sway,
                duration: duration / 2,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
              }),
            ]),
            Animated.sequence([
              Animated.timing(o, {
                toValue: 0.85,
                duration: duration * 0.25,
                useNativeDriver: true,
              }),
              Animated.timing(o, {
                toValue: 0,
                duration: duration * 0.75,
                useNativeDriver: true,
              }),
            ]),
          ]),
          Animated.parallel([
            Animated.timing(y, { toValue: 0, duration: 0, useNativeDriver: true }),
            Animated.timing(x, { toValue: 0, duration: 0, useNativeDriver: true }),
            Animated.timing(o, { toValue: 0, duration: 0, useNativeDriver: true }),
          ]),
        ])
      ),
    ]).start();
  }, [y, x, o, delay, duration, sway]);

  return (
    <Animated.View
      style={[
        splashStyles.particle,
        {
          left,
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity: o,
          transform: [{ translateY: y }, { translateX: x }],
        },
      ]}
    />
  );
}

const PARTICLES = [
  { left: 40, size: 7, delay: 900, duration: 5200, sway: 14 },
  { left: 110, size: 5, delay: 2200, duration: 6100, sway: -18 },
  { left: 190, size: 8, delay: 400, duration: 4800, sway: 10 },
  { left: 260, size: 5, delay: 3100, duration: 5600, sway: -12 },
  { left: 330, size: 6, delay: 1500, duration: 6400, sway: 16 },
  { left: 70, size: 4, delay: 4200, duration: 5000, sway: -10 },
  { left: 300, size: 4, delay: 5300, duration: 5900, sway: 12 },
];

export default function SplashScreen({ onEnter }: { onEnter: () => void }) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.72)).current;
  const shineX = useRef(new Animated.Value(-280)).current;
  const floatY = useRef(new Animated.Value(0)).current;
  const ringSpin = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonRise = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    // 0 → 1.4s: cinematic dolly-in.
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 1100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1.04,
        duration: 1400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
    // 1.4 → 2.1s: settle.
    Animated.sequence([
      Animated.delay(1400),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 700,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
    ]).start();
    // Shine sweeps at 1.5s and again at 4s.
    Animated.sequence([
      Animated.delay(1500),
      Animated.timing(shineX, {
        toValue: 280,
        duration: 1200,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
    Animated.sequence([
      Animated.delay(4000),
      Animated.timing(shineX, { toValue: -280, duration: 0, useNativeDriver: true }),
      Animated.timing(shineX, {
        toValue: 280,
        duration: 1300,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
    // Gentle float from 1.8s onward.
    Animated.sequence([
      Animated.delay(1800),
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatY, {
            toValue: -12,
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(floatY, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
    // Slow rotating arc around the logo.
    Animated.loop(
      Animated.timing(ringSpin, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
    // Progress bar fills over the first 6s.
    Animated.timing(progress, {
      toValue: 1,
      duration: 6000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
    // 6 → 7s: Enter button rises in.
    Animated.sequence([
      Animated.delay(6000),
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(buttonRise, {
          toValue: 0,
          duration: 1000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [logoOpacity, logoScale, shineX, floatY, ringSpin, progress, buttonOpacity, buttonRise]);

  const spin = ringSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });

  return (
    <LinearGradient
      colors={[NAVY, "#16345f", NAVY]}
      style={splashStyles.container}
    >
      {PARTICLES.map((p, i) => (
        <Particle key={i} {...p} />
      ))}

      <View style={splashStyles.stage}>
        <Animated.View
          style={[splashStyles.arc, { transform: [{ rotate: spin }] }]}
        />
        <View style={splashStyles.ring} />
        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [{ scale: logoScale }, { translateY: floatY }],
          }}
        >
          <View style={splashStyles.logoClip}>
            <Image
              source={LOGO}
              style={{
                width: IMG_SIZE,
                height: IMG_SIZE,
                marginLeft: IMG_OFFSET,
                marginTop: IMG_OFFSET,
              }}
              resizeMode="cover"
            />
            <Animated.View
              style={[
                splashStyles.shine,
                { transform: [{ translateX: shineX }, { rotate: "20deg" }] },
              ]}
            />
          </View>
        </Animated.View>
      </View>

      <View style={splashStyles.progressTrack}>
        <Animated.View style={[splashStyles.progressFill, { width: progressWidth }]} />
      </View>

      <Animated.View
        style={[
          splashStyles.buttonWrap,
          { opacity: buttonOpacity, transform: [{ translateY: buttonRise }] },
        ]}
      >
        <Pressable style={splashStyles.enterButton} onPress={onEnter}>
          <Text style={splashStyles.enterText}>Enter</Text>
        </Pressable>
      </Animated.View>
    </LinearGradient>
  );
}

const STAGE = 340;

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  stage: {
    width: STAGE,
    height: STAGE,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    width: STAGE,
    height: STAGE,
    borderRadius: STAGE / 2,
    borderWidth: 2,
    borderColor: GOLD,
    opacity: 0.35,
  },
  arc: {
    position: "absolute",
    width: STAGE,
    height: STAGE,
    borderRadius: STAGE / 2,
    borderWidth: 4,
    borderColor: "transparent",
    borderTopColor: GOLD,
  },
  logoClip: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  shine: {
    position: "absolute",
    top: -120,
    left: LOGO_SIZE / 2 - 35,
    width: 70,
    height: LOGO_SIZE + 240,
    backgroundColor: "#ffffff",
    opacity: 0.28,
  },
  particle: {
    position: "absolute",
    bottom: 60,
    backgroundColor: GOLD,
  },
  progressTrack: {
    marginTop: 44,
    width: 200,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(245, 166, 35, 0.25)",
    overflow: "hidden",
  },
  progressFill: {
    height: 3,
    backgroundColor: GOLD,
  },
  buttonWrap: {
    marginTop: 28,
    width: "100%",
    maxWidth: 320,
  },
  enterButton: {
    backgroundColor: GOLD,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  enterText: {
    color: NAVY,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 3,
  },
});
