import type { ReactNode } from 'react';
import {
  ImageBackground,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

const backgroundImage = require('@/assets/backgrounds/gonext-bg.png');

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function ScreenBackground({ children, style }: Props) {
  return (
    <ImageBackground
      source={backgroundImage}
      style={[styles.background, style]}
      imageStyle={styles.image}
      resizeMode="cover"
    >
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  // width/height нужны: на web ImageBackground проксирует их во внутренний Image.
  // Без них картинка берёт intrinsic-размер и раздувает страницу.
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  // Не ставить overflow:'hidden' на контейнер: у ImageBackground на web
  // картинка с zIndex:-1, и overflow её полностью прячет.
  image: {
    zIndex: 0,
  },
});
