import type { Track } from '@audius/common/models'
import { SquareSizes } from '@audius/common/models'
import { View } from 'react-native'

import {
  IconVisibilityHidden,
  IconPause,
  IconPlay
} from '@audius/harmony-native'
import { TrackImage } from 'app/components/image/TrackImage'
import { makeStyles } from 'app/styles'
import { useThemeColors } from 'app/utils/theme'

type TrackArtworkProps = {
  track: Track
  isActive?: boolean
  isUnlisted?: boolean
  isPlaying: boolean
}

const useStyles = makeStyles(({ spacing }) => ({
  image: {
    borderRadius: 4,
    height: 52,
    width: 52,
    marginRight: spacing(4)
  },
  artworkIcon: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.4)'
  }
}))

export const TrackArtwork = (props: TrackArtworkProps) => {
  const { isPlaying, isActive, track, isUnlisted } = props
  const styles = useStyles()
  const { staticWhite } = useThemeColors()

  const ActiveIcon = isPlaying ? IconPause : IconPlay

  return (
    <TrackImage
      track={track}
      size={SquareSizes.SIZE_150_BY_150}
      style={styles.image}
    >
      {isUnlisted && !isActive ? (
        <View style={styles.artworkIcon}>
          <IconVisibilityHidden fill={staticWhite} />
        </View>
      ) : null}
      {isActive ? (
        <View style={styles.artworkIcon}>
          <ActiveIcon color='staticWhite' style={{ opacity: 0.8 }} />
        </View>
      ) : null}
    </TrackImage>
  )
}
