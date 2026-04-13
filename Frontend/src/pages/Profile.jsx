import React, { useEffect, useState } from 'react'
// import './UpdateProfile.scss'
// import userPlaceholder from '../../assets/user.png'
// import { useDispatch, useSelector } from 'react-redux'
// import { setLoading, updateMyProfile } from '../../redux/Slices/appConfigSlice'
// import { axiosClient } from '../../utils/axiosClient'
// import { KEY_ACCESS_TOKEN, removeItem } from '../../utils/localStorageManager'
import { useNavigate } from 'react-router'

const UpdateProfile = () => {
    const myProfile = useSelector((state) => state.appConfigReducer.myProfile)
    const [name, setName] = useState('')
    const [bio, setBio] = useState('')
    const [userImg, setUserImg] = useState('')
    const dispatch = useDispatch()
    const navigate = useNavigate()
    useEffect(() => {
        setName(myProfile?.name || '')
        setBio(myProfile?.bio || '')
        setUserImg(myProfile?.avatar?.url || '')
    }, [myProfile])

    const handleImgChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => {
            setUserImg(reader.result)
        }
        reader.readAsDataURL(file)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        dispatch(updateMyProfile({
            name, bio, userImg
        }))
        console.log({ name, bio, userImg })
    }

    const handleDelete = async () => {
        if (window.confirm('Delete your account? This cannot be undone.')) {
            try {
                dispatch(setLoading(true))
                await axiosClient.delete('/post/deleteprofile')
                removeItem(KEY_ACCESS_TOKEN)
                navigate('/login')
            } catch (error) {

            } finally {
                dispatch(setLoading(false))
            }
        }

    }

    return (
        <div className='UpdateProfile'>
            <div className="container">
                <div className="left">
                    <div className="input-user-img">
                        <label htmlFor="userImg" className='label-img'>
                            <img src={userImg || userPlaceholder} alt="User Img" />
                        </label>
                        <input className='InputImg' type="file" id="userImg" accept='image/*' onChange={handleImgChange} />
                    </div>
                </div>
                <div className="right">
                    <form className='updateProfileForm' onSubmit={handleSubmit}>
                        <input value={name} type="text" placeholder='Your Name' onChange={(e) => setName(e.target.value)} />
                        <textarea value={bio} rows={4} cols={50} placeholder='Edit Your Bio' onChange={(e) => setBio(e.target.value)}></textarea>
                        <input onClick={handleSubmit} type="submit" className='submit-btn' />
                    </form>
                    <button className='delete-btn' onClick={handleDelete}>Delete Account</button>
                </div>
            </div>
        </div >
    )
}

export default UpdateProfile
// ...existing code...