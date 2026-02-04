import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, View, ViewStyle} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

type Props = {
  size?: number;
  style?: ViewStyle;
};

export default function DreamyBubble({size = 150, style}: Props) {
  const float = useRef(new Animated.Value(0)).current;
  const drift = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 3200,
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 3200,
          useNativeDriver: true,
        }),
      ]),
    );
    const driftLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: 4200,
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: 4200,
          useNativeDriver: true,
        }),
      ]),
    );
    const rotateLoop = Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 7600,
        useNativeDriver: true,
      }),
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 2800,
          useNativeDriver: true,
        }),
      ]),
    );

    floatLoop.start();
    driftLoop.start();
    rotateLoop.start();
    pulseLoop.start();

    return () => {
      floatLoop.stop();
      driftLoop.stop();
      rotateLoop.stop();
      pulseLoop.stop();
    };
  }, [drift, float, rotate, pulse]);

  const bubbleSize = size;
  const highlightSize = size * 0.58;
  const softCoreSize = size * 0.72;
  const glowSize = size * 1.15;
  const hazeSize = size * 1.35;
  const containerSize = Math.max(hazeSize, glowSize, bubbleSize);

  return (
    <Animated.View
      shouldRasterizeIOS
      renderToHardwareTextureAndroid
      style={[
        styles.wrapper,
        {
          width: containerSize,
          height: containerSize,
          transform: [
            {
              translateY: float.interpolate({
                inputRange: [0, 1],
                outputRange: [8, -6],
              }),
            },
            {
              translateX: drift.interpolate({
                inputRange: [0, 1],
                outputRange: [-6, 5],
              }),
            },
            {
              scale: float.interpolate({
                inputRange: [0, 1],
                outputRange: [0.97, 1.04],
              }),
            },
          ],
        },
        style,
      ]}>
      <Animated.View
        style={[
          styles.outerGlow,
          {
            width: glowSize,
            height: glowSize,
            borderRadius: glowSize / 2,
            transform: [
              {
                scale: pulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1.01, 1.07],
                }),
              },
            ],
          },
        ]}>
        <LinearGradient
          colors={['rgba(234,247,255,0.3)', 'rgba(241,233,255,0.26)', 'rgba(255,255,255,0.24)']}
          start={{x: 0.15, y: 0.2}}
          end={{x: 0.85, y: 0.8}}
          style={styles.fill}
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.haze,
          {
            width: hazeSize,
            height: hazeSize,
            borderRadius: hazeSize / 2,
            transform: [
              {
                rotate: rotate.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
              {
                scale: pulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.98, 1.04],
                }),
              },
            ],
          },
        ]}>
        <LinearGradient
          colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0)']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.fill}
        />
      </Animated.View>
      <View
        style={[
          styles.clip,
          {
            width: bubbleSize,
            height: bubbleSize,
            borderRadius: bubbleSize / 2,
          },
        ]}>
        <LinearGradient
          colors={[
            'rgba(234,247,255,0.95)',
            'rgba(241,233,255,0.88)',
            'rgba(255,255,255,0.82)',
            'rgba(224,240,255,0.72)',
          ]}
          start={{x: 0.05, y: 0.05}}
          end={{x: 0.95, y: 0.95}}
          style={styles.fill}
        />
        <LinearGradient
          colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0)']}
          start={{x: 0.15, y: 0.15}}
          end={{x: 0.9, y: 0.9}}
          style={[
            styles.softCore,
            {
              width: softCoreSize,
              height: softCoreSize,
              borderRadius: softCoreSize / 2,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.swirl,
            {
              width: bubbleSize * 0.94,
              height: bubbleSize * 0.94,
              borderRadius: (bubbleSize * 0.94) / 2,
              transform: [
                {
                  rotate: rotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
                {
                  translateX: pulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-3, 3],
                  }),
                },
              ],
            },
          ]}>
          <LinearGradient
            colors={[
              'rgba(234,247,255,0.22)',
              'rgba(241,233,255,0.18)',
              'rgba(255,255,255,0.14)',
              'rgba(224,240,255,0.2)',
            ]}
            start={{x: 0, y: 0.25}}
            end={{x: 1, y: 0.75}}
            style={styles.fill}
          />
        </Animated.View>
        <Animated.View
          style={[
            styles.highlight,
            {
              width: highlightSize,
              height: highlightSize,
              borderRadius: highlightSize / 2,
              transform: [
                {
                  translateX: pulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 7],
                  }),
                },
                {
                  translateY: pulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -6],
                  }),
                },
                {
                  scale: pulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.98, 1.04],
                  }),
                },
              ],
            },
          ]}>
          <LinearGradient
            colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0)']}
            start={{x: 0.15, y: 0.15}}
            end={{x: 0.85, y: 0.85}}
            style={styles.fill}
          />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerGlow: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#C1C7F2',
    shadowOffset: {width: 0, height: 14},
    shadowOpacity: 0.28,
    shadowRadius: 28,
    elevation: 6,
  },
  haze: {
    position: 'absolute',
    opacity: 0.4,
  },
  clip: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  softCore: {
    position: 'absolute',
    opacity: 0.5,
  },
  swirl: {
    position: 'absolute',
    opacity: 0.3,
  },
  highlight: {
    position: 'absolute',
    top: 18,
    left: 18,
    opacity: 0.45,
  },
  fill: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
});
