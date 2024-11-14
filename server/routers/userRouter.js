import {Router} from 'express'
import { changePassword, getSuggestedUsers, getUserProfile, toggleFollowUser, updateUserProfile } from '../controllers/userController.js'
import protectRoute from '../middlewares/protectRoute.js'

const router = Router()

router.get('/profile/:username', protectRoute, getUserProfile)
router.get('/suggested', protectRoute, getSuggestedUsers)

router.post('/follow/:id', protectRoute, toggleFollowUser)

router.patch('/update', protectRoute, updateUserProfile)
router.patch('/changePassword', protectRoute, changePassword)



export default router