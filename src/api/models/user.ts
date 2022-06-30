import bcrypt from 'bcrypt'
import { Schema, Document, model, Model } from 'mongoose'

import validator from 'validator'

interface IUserDocument extends Document {
  password: string
  username: string
  created: Date
  attempts: number
  attempted: Date,
}

export interface IUser extends IUserDocument {
  // document level operations
  comparePassword(password: string): Promise<boolean>
}

const isUsername = new RegExp('^[a-zA-Z0-9_\.\-]{1,}$')

const userSchema = new Schema<IUser>({
  password: { type: String, required: true },
  username: { type: String, required: true, validate: [isUsername, 'do not match username regex'] },
  created: { type: Date, default: Date.now },
  attempts: { type: Number, default: 3 },
  attempted: { type: Date }
}, { strict: true })
  .index({ username: 1 }, { unique: true, collation: { locale: 'en_US', strength: 1 }, sparse: true })

userSchema.pre<IUserDocument>('save', function (next): void {
  if (this.isModified('password')) {
    // generate hash for password
    bcrypt.genSalt(10, (err, salt) => {
      /* istanbul ignore next */
      if (err) return next(err)
      bcrypt.hash(this.password, salt, (err, hash) => {
        /* istanbul ignore next */
        if (err) return next(err)
        this.password = hash
        next()
      })
    })
  } else {
    next()
  }
})

userSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret.created = ret.created.getTime()

    delete ret.__v
    delete ret._id
    delete ret.password
  }
})

userSchema.methods.comparePassword = function (candidatePassword: string): Promise<boolean> {
  const { password } = this
  return new Promise(function (resolve, reject) {
    bcrypt.compare(candidatePassword, password, function (err, isMatch) {
      /* istanbul ignore next */
      if (err) return reject(err)
      return resolve(isMatch)
    })
  })
}

export interface IUserModel extends Model<IUser> {
  // collection/docouments level operations (fetch one or many, update, save back to db)
}

export const User: IUserModel = model<IUser, IUserModel>('User', userSchema)

export default User
