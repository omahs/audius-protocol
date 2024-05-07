import { useCallback, useContext, useEffect } from 'react'

import {
  formatCooldownChallenges,
  useChallengeCooldownSchedule
} from '@audius/common/hooks'
import {
  ClaimStatus,
  audioRewardsPageActions,
  audioRewardsPageSelectors,
  musicConfettiActions
} from '@audius/common/store'
import { formatNumberCommas } from '@audius/common/utils'
import {
  Button,
  Flex,
  IconArrowRight,
  ModalContent,
  Text
} from '@audius/harmony'
import { useDispatch, useSelector } from 'react-redux'

import { useModalState } from 'common/hooks/useModalState'
import { SummaryTable } from 'components/summary-table'
import { ToastContext } from 'components/toast/ToastContext'
import { useWithMobileStyle } from 'hooks/useWithMobileStyle'
import { CLAIM_REWARD_TOAST_TIMEOUT_MILLIS } from 'utils/constants'

import ModalDrawer from '../ModalDrawer'

import styles from './styles.module.css'

const messages = {
  upcomingRewards: 'Upcoming Rewards',
  claimAudio: (amount: string) => `Claim ${amount} $AUDIO`,
  readyToClaim: 'Ready to claim!',
  rewardsClaimed: 'All rewards claimed successfully!',
  rewards: 'Rewards',
  audio: '$AUDIO',
  description: 'You can check and claim all your upcoming rewards here.',
  done: 'Done'
}

const { show: showConfetti } = musicConfettiActions
const { claimAllChallengeRewards, resetAndCancelClaimReward } =
  audioRewardsPageActions
const { getClaimStatus } = audioRewardsPageSelectors

export const ClaimAllRewardsModal = () => {
  const dispatch = useDispatch()
  const { toast } = useContext(ToastContext)
  const wm = useWithMobileStyle(styles.mobile)
  const [isOpen, setOpen] = useModalState('ClaimAllRewards')
  const claimStatus = useSelector(getClaimStatus)
  const { claimableAmount, claimableChallenges, cooldownChallenges, summary } =
    useChallengeCooldownSchedule({
      multiple: true
    })
  const claimInProgress = claimStatus === ClaimStatus.CUMULATIVE_CLAIMING
  const hasClaimed = claimStatus === ClaimStatus.CUMULATIVE_SUCCESS

  useEffect(() => {
    if (hasClaimed) {
      toast(messages.rewardsClaimed, CLAIM_REWARD_TOAST_TIMEOUT_MILLIS)
      dispatch(showConfetti())
    }
  }, [toast, dispatch, hasClaimed])

  const onClaimRewardClicked = useCallback(() => {
    const claims = claimableChallenges.map((challenge) => ({
      challengeId: challenge.challenge_id,
      specifiers: [
        { specifier: challenge.specifier, amount: challenge.amount }
      ],
      amount: challenge.amount
    }))
    dispatch(claimAllChallengeRewards({ claims }))
  }, [dispatch, claimableChallenges])

  const handleClose = useCallback(() => {
    dispatch(resetAndCancelClaimReward())
    setOpen(false)
  }, [dispatch, setOpen])

  const formatLabel = useCallback((item: any) => {
    const { label, claimableDate, isClose } = item
    const formattedLabel = isClose ? (
      label
    ) : (
      <Text>
        {label}&nbsp;
        <Text color='subdued'>{claimableDate.format('(M/D)')}</Text>
      </Text>
    )
    return {
      ...item,
      label: formattedLabel
    }
  }, [])

  return (
    <ModalDrawer
      title={messages.rewards}
      showTitleHeader
      isOpen={isOpen}
      onClose={handleClose}
      isFullscreen={true}
      useGradientTitle={false}
      titleClassName={wm(styles.title)}
      headerContainerClassName={styles.header}
    >
      <ModalContent>
        <Flex direction='column' gap='2xl' mt='s'>
          <Text variant='body' textAlign='left'>
            {messages.description}
          </Text>
          <SummaryTable
            title={messages.upcomingRewards}
            items={formatCooldownChallenges(cooldownChallenges).map(
              formatLabel
            )}
            summaryItem={summary}
            secondaryTitle={messages.audio}
            summaryLabelColor='accent'
            summaryValueColor='default'
          />
          {claimableAmount > 0 && !hasClaimed ? (
            <Button
              disabled={claimInProgress}
              isLoading={claimInProgress}
              onClick={onClaimRewardClicked}
              iconRight={IconArrowRight}
              fullWidth
            >
              {messages.claimAudio(formatNumberCommas(claimableAmount))}
            </Button>
          ) : (
            <Button variant='primary' fullWidth onClick={() => setOpen(false)}>
              {messages.done}
            </Button>
          )}
        </Flex>
      </ModalContent>
    </ModalDrawer>
  )
}
