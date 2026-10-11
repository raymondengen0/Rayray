/**
 * Cinematic home screen for the Rayray app.
 *
 * Raymond's talking-avatar intro video takes the hero spot in a
 * gold-bordered frame: it autoplays muted and loops, and tapping it
 * toggles the sound so visitors hear his welcome line. The slogan and
 * the Enter button follow below, with gold particles drifting upward.
 */
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useVideoPlayer, VideoView } from "expo-video";

const AVATAR_VIDEO = require("../../assets/avatar-intro.mp4");

const VIDEO_SIZE = 300;

const GOLD = "#f5a623";
const NAVY = "#0b2545";
const BLUE = "#5DADE2";

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
  const [muted, setMuted] = useState(true);

  const player = useVideoPlayer(AVATAR_VIDEO, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  const enableSound = () => {
    // Browsers block audible autoplay, so the video starts muted and the
    // first tap anywhere (on the video, the background, anywhere) enables
    // sound and makes sure the video is playing. One-way: tapping again
    // does not re-mute.
    if (muted) {
      player.muted = false;
      player.play();
      setMuted(false);
    }
  };

  const videoOpacity = useRef(new Animated.Value(0)).current;
  const videoScale = useRef(new Animated.Value(0.92)).current;
  const sloganOpacity = useRef(new Animated.Value(0)).current;
  const sloganRise = useRef(new Animated.Value(24)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonRise = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    // Video fades in with a gentle settle.
    Animated.parallel([
      Animated.timing(videoOpacity, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(videoScale, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
    // Slogan makes its entrance shortly after.
    Animated.sequence([
      Animated.delay(1400),
      Animated.parallel([
        Animated.timing(sloganOpacity, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(sloganRise, {
          toValue: 0,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    // Enter button rises in last.
    Animated.sequence([
      Animated.delay(2400),
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(buttonRise, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [
    videoOpacity,
    videoScale,
    sloganOpacity,
    sloganRise,
    buttonOpacity,
    buttonRise,
  ]);

  return (
    <Pressable
      onPress={enableSound}
      style={splashStyles.pressContainer}
      accessibilityLabel="Intro screen"
    >
    <LinearGradient
      colors={[
        "rgba(11, 37, 69, 0.55)",
        "rgba(22, 52, 95, 0.55)",
        "rgba(11, 37, 69, 0.55)",
      ]}
      style={splashStyles.container}
    >
      {PARTICLES.map((p, i) => (
        <Particle key={i} {...p} />
      ))}

      <Text style={splashStyles.eyebrow}>NAILED IT HANDYMAN SERVICES</Text>

      <Animated.View
        style={{
          opacity: videoOpacity,
          transform: [{ scale: videoScale }],
        }}
      >
        <Pressable onPress={enableSound} accessibilityLabel="Tap for sound">
          <View style={splashStyles.videoFrame}>
            <VideoView
              player={player}
              style={splashStyles.video}
              contentFit="cover"
              nativeControls={false}
              playsInline
              pointerEvents="none"
            />
            {muted && (
              <View style={splashStyles.playOverlay} pointerEvents="none">
                <View style={splashStyles.playCircle}>
                  <Text style={splashStyles.playGlyph}>▶</Text>
                </View>
              </View>
            )}
          </View>
        </Pressable>
      </Animated.View>

      <Animated.View
        style={[
          splashStyles.sloganWrap,
          {
            opacity: sloganOpacity,
            transform: [{ translateY: sloganRise }],
          },
        ]}
      >
        <Text style={splashStyles.slogan}>Get Nailed. Professionally!!</Text>
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
    </LinearGradient>
    </Pressable>
  );
}

const splashStyles = StyleSheet.create({
  pressContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  eyebrow: {
    color: GOLD,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 4,
    marginBottom: 18,
    textAlign: "center",
  },
  videoFrame: {
    width: VIDEO_SIZE + 18,
    height: VIDEO_SIZE + 18,
    borderRadius: 44,
    borderWidth: 9,
    borderColor: GOLD,
    overflow: "hidden",
    backgroundColor: NAVY,
  },
  video: {
    width: VIDEO_SIZE,
    height: VIDEO_SIZE,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  playCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  playGlyph: {
    color: "#fff",
    fontSize: 34,
    marginLeft: 4,
  },
  sloganWrap: {
    marginTop: 26,
    paddingHorizontal: 16,
  },
  slogan: {
    color: BLUE,
    fontSize: 26,
    fontStyle: "italic",
    fontWeight: "700",
    letterSpacing: 1.5,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.6)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  particle: {
    position: "absolute",
    bottom: 60,
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
