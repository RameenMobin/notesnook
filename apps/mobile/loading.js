import React from 'react';
import * as Animatable from 'react-native-animatable';
import {useTracked} from './src/provider';
import {dWidth} from './src/utils';
import {SIZE, WEIGHT} from "./src/utils/SizeUtils";
export const Loading = () => {
  const [state, dispatch] = useTracked();
  const {colors, loading} = state;

  return (
    <>
      <Animatable.View
        transition={['translateX']}
        useNativeDriver={true}
        duration={1000}
        delay={2500}
        style={{
          width: '50%',
          left: 0,
          height: '100%',
          position: 'absolute',
          backgroundColor: colors.accent,
          justifyContent: 'center',
          alignItems: 'flex-end',
          zIndex: 999,
          transform: [
            {
              translateX: loading ? 0 : -dWidth * 2,
            },
          ],
        }}>
        <Animatable.Text
          animation="fadeIn"
          duration={300}
          delay={150}
          style={{
            color: 'white',
            fontFamily: WEIGHT.bold,
            fontSize: SIZE.xxl,
          }}>
          notes
        </Animatable.Text>
        <Animatable.Text
          animation="fadeIn"
          duration={300}
          delay={600}
          style={{
            color: 'white',
            fontFamily: WEIGHT.regular,
            fontSize: SIZE.md,
            marginTop: 15,
          }}>
          A safe plac
        </Animatable.Text>
      </Animatable.View>
      <Animatable.View
        transition={['translateX']}
        useNativeDriver={true}
        duration={1000}
        delay={2500}
        style={{
          width: '50%',
          right: 0,
          height: '100%',
          position: 'absolute',
          backgroundColor: colors.accent,
          justifyContent: 'center',
          alignItems: 'flex-start',
          zIndex: 999,
          transform: [
            {
              translateX: loading ? 0 : dWidth * 2,
            },
          ],
        }}>
        <Animatable.Text
          animation="fadeIn"
          duration={300}
          delay={150}
          style={{
            color: 'white',
            fontFamily: WEIGHT.bold,
            fontSize: SIZE.xxl,
          }}>
          nook
        </Animatable.Text>
        <Animatable.Text
          animation="fadeIn"
          duration={300}
          delay={600}
          style={{
            color: 'white',
            fontFamily: WEIGHT.regular,
            fontSize: SIZE.md,
            marginTop: 15,
          }}>
          e to write
        </Animatable.Text>
      </Animatable.View>
 
    </>
  );
};
