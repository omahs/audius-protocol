import type { CSSProperties, ReactElement } from 'react'

import { useTheme } from '@emotion/react'

import { Flex, Text } from 'components'
import { IconValidationCheck, IconValidationX } from 'icons'

const messages = {
  do: 'Do',
  dont: "Don't"
}

type ComponentRuleProps = {
  className?: string
  component: ReactElement
  description: ReactElement | string
  isRecommended: boolean
  style?: CSSProperties
}

export const ComponentRule = (props: ComponentRuleProps) => {
  const {
    className,
    component,
    description = '',
    isRecommended = false
  } = props
  const TitleIcon = isRecommended ? IconValidationCheck : IconValidationX
  const title = isRecommended ? messages.do : messages.dont

  const { color, cornerRadius } = useTheme()
  const borderColor = isRecommended ? color.status.success : color.status.error

  return (
    <Flex as='section' direction='column' gap='xl' flex={1}>
      <Flex direction='column' gap='m'>
        <Text
          variant='title'
          tag='h5'
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <TitleIcon size='s' style={{ marginRight: '8px' }} /> {title}
        </Text>
        <Text tag='section' style={{ height: '32px', overflow: 'hidden' }}>
          {description}
        </Text>
      </Flex>
      <Flex
        className={className}
        as='figure'
        p='2xl'
        border='strong'
        justifyContent='center'
        css={{
          border: `1px solid ${borderColor}`,
          borderRadius: cornerRadius.m
        }}
      >
        {component}
      </Flex>
    </Flex>
  )
}
