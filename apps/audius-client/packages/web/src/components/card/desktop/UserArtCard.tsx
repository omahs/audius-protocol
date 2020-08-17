import React, { useCallback } from 'react'
import { connect } from 'react-redux'
import { push as pushRoute } from 'connected-react-router'

import cn from 'classnames'

import { ReactComponent as IconVerified } from 'assets/img/iconVerified.svg'
import placeholderArt from 'assets/img/imageBlank2x.png'
import styles from './UserArtCard.module.css'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import { SquareSizes } from 'models/common/ImageSizes'
import { useUserProfilePicture } from 'hooks/useImageSize'
import { ID } from 'models/common/Identifiers'
import { AppState } from 'store/types'
import { Dispatch } from 'redux'
import { getUser } from 'store/cache/users/selectors'
import PerspectiveCard from 'components/perspective-card/PerspectiveCard'
import { profilePage } from 'utils/route'
import { formatCount } from 'utils/formatUtil'
import {
  setUsers,
  setVisibility
} from 'store/application/ui/userListModal/slice'
import {
  UserListType,
  UserListEntityType
} from 'store/application/ui/userListModal/types'
import { withNullGuard } from 'utils/withNullGuard'

const messages = {
  followers: (count: number) => `${formatCount(count)} Followers`
}

type OwnProps = {
  className?: string
  id: ID
  index: number
  isLoading?: boolean
  setDidLoad?: (index: number) => void
}

type UserArtCardProps = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>

const g = withNullGuard((props: UserArtCardProps) => {
  const { user } = props
  if (user) return { ...props, user }
})

const UserArtCard = g(
  ({
    className,
    index,
    isLoading,
    setDidLoad,
    user,
    setFollowerUser,
    setModalVisibility,
    goToRoute
  }) => {
    const {
      user_id,
      _profile_picture_sizes,
      name,
      handle,
      follower_count,
      is_verified
    } = user

    const goToProfile = useCallback(() => {
      const link = profilePage(handle)
      goToRoute(link)
    }, [handle, goToRoute])

    const onClickFollowers = useCallback(() => {
      setFollowerUser(user_id)
      setModalVisibility()
    }, [setFollowerUser, setModalVisibility, user_id])

    const image = useUserProfilePicture(
      user_id,
      _profile_picture_sizes,
      SquareSizes.SIZE_480_BY_480,
      placeholderArt
    )
    if (image && setDidLoad) setDidLoad(index)

    return (
      <div className={cn(styles.card, className)}>
        <PerspectiveCard
          onClick={goToProfile}
          className={styles.perspectiveCard}
        >
          <DynamicImage
            wrapperClassName={styles.profilePicture}
            image={isLoading ? '' : image}
          />
        </PerspectiveCard>
        <div className={styles.userName} onClick={goToProfile}>
          <span>{name}</span>
          {is_verified && <IconVerified className={styles.iconVerified} />}
        </div>
        <div className={styles.followerCount} onClick={onClickFollowers}>
          {messages.followers(follower_count as number)}
        </div>
      </div>
    )
  }
)

function mapStateToProps(state: AppState, ownProps: OwnProps) {
  return {
    user: getUser(state, { id: ownProps.id })
  }
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    setFollowerUser: (userID: ID) =>
      dispatch(
        setUsers({
          userListType: UserListType.FOLLOWER,
          entityType: UserListEntityType.USER,
          id: userID
        })
      ),
    setModalVisibility: () => dispatch(setVisibility(true)),
    goToRoute: (route: string) => dispatch(pushRoute(route))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserArtCard)
