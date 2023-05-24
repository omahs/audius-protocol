import { combineReducers } from 'redux'

import { collectionApiReducer } from './collection'
import { relatedArtistsApiReducer } from './relatedArtists'
import { trackApiReducer } from './track'
import { userApiReducer } from './user'

export default combineReducers({
  collectionApi: collectionApiReducer,
  relatedArtistsApi: relatedArtistsApiReducer,
  trackApi: trackApiReducer,
  userApi: userApiReducer
})
