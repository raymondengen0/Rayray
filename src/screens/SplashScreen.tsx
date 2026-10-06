/**
 * Animated home/splash screen for the Rayray app.
 *
 * The Nailed It Handyman Services logo fades and scales in, then an Enter
 * button appears. Tapping Enter takes the customer to the Services tab.
 */
import React, { useEffect, useRef } from "react";
import { Animated, Image, Pressable, StyleSheet, Text, View } from "react-native";

const LOGO = require("../../assets/nailed-it-logo.png");

export default function SplashScreen({ onEnter }: { onEnter: () => void }) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonRise = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 60,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(buttonRise, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [logoOpacity, logoScale, buttonOpacity, buttonRise]);

  return (
    <View style={splashStyles.container}>
      <Animated.View
        style={[
          splashStyles.logoWrap,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        <Image source={LOGO} style={splashStyles.logo} resizeMode="contain" />
      </Animated.View>

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
    </View>
  );
}

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  logoWrap: {
    alignItems: "center",
  },
  logo: {
    width: 280,
    height: 280,
  },
  buttonWrap: {
    marginTop: 48,
    width: "100%",
    maxWidth: 320,
  },
  enterButton: {
    backgroundColor: "#0b2545",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  enterText: {
    color: "#f5a623",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 2,
  },
});
