
import yup from "yup"
export const UserSchema = yup.object({
    username: yup
        .string()
        .trim()
        .min(3, "username must be atleast of 3 charcters")
        .required(),

    email: yup
        .string()
        .email("The email is not valid one")
        .required(),
    password: yup
        .string()
        .min(4, "Password must be atleast 4 character")
        .required()

})
export const validateUser = (schema) => async (req, res, next) => {
    try {
        await schema.validate(req.body)
        next()
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}