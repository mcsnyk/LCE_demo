const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')

const Story = require('../models/Story')

// VULNERABLE part:
const jwt = require('jsonwebtoken')
function jwtChallenge (challenge, req, algorithm, email) {
  const token = utils.jwtFrom(req)
  if (token) {
    // M - Insecure JWT Verification Method
    const decoded = jws.decode(token) ? jwt.decode(token) : null
    jwt.verify(token, insecurity.publicKey, (err, verified) => {
      if (err === null) {
        utils.solveIf(challenge, () => { return hasAlgorithm(token, algorithm) && hasEmail(decoded, email) })
      }
    })
  }
}

// or
// M -  Use of Password Hash With Insufficient Computational Effort:
// exports.ctfFlag = text => {
//   const shaObj = new jsSHA('SHA-1', 'TEXT') // eslint-disable-line new-cap
//   shaObj.setHMACKey(ctfKey, 'TEXT')
//   shaObj.update(text)
//   return shaObj.getHMAC('HEX')
// }

// or
// H - Hardcoded Secret:
const privateKey = '-----BEGIN RSA PRIVATE KEY-----\r\nMIICXAIBAAKBgQDNwqLEe9wgTXCbC7+RPdDbBbeqjdbs4kOPOIGzqLpXvJXlxxW8iMz0EaM4BKUqYsIa+ndv3NAn2RxCd5ubVdJJcX43zO6Ko0TFEZx/65gY3BE0O6syCEmUP4qbSd6exou/F+WTISzbQ5FBVPVmhnYhG/kpwt/cIxK5iUn5hm+4tQIDAQABAoGBAI+8xiPoOrA+KMnG/T4jJsG6TsHQcDHvJi7o1IKC/hnIXha0atTX5AUkRRce95qSfvKFweXdJXSQ0JMGJyfuXgU6dI0TcseFRfewXAa/ssxAC+iUVR6KUMh1PE2wXLitfeI6JLvVtrBYswm2I7CtY0q8n5AGimHWVXJPLfGV7m0BAkEA+fqFt2LXbLtyg6wZyxMA/cnmt5Nt3U2dAu77MzFJvibANUNHE4HPLZxjGNXN+a6m0K6TD4kDdh5HfUYLWWRBYQJBANK3carmulBwqzcDBjsJ0YrIONBpCAsXxk8idXb8jL9aNIg15Wumm2enqqObahDHB5jnGOLmbasizvSVqypfM9UCQCQl8xIqy+YgURXzXCN+kwUgHinrutZms87Jyi+D8Br8NY0+Nlf+zHvXAomD2W5CsEK7C+8SLBr3k/TsnRWHJuECQHFE9RA2OP8WoaLPuGCyFXaxzICThSRZYluVnWkZtxsBhW2W8z1b8PvWUE7kMy7TnkzeJS2LSnaNHoyxi7IaPQUCQCwWU4U+v4lD7uYBw00Ga/xt+7+UqFPlPVdz1yyr4q24Zxaw0LgmuEvgU5dycq8N7JxjTubX0MIRR+G9fmDBBl8=\r\n-----END RSA PRIVATE KEY-----'

exports.deluxeToken = (email) => {
  const hmac = crypto.createHmac('sha256', privateKey)
  return hmac.update(email + this.roles.deluxe).digest('hex')
}


// @desc    Show add page
// @route   GET /stories/add
router.get('/add', ensureAuth, (req, res) => {
  res.render('stories/add')
})

// @desc    Process add form
// @route   POST /stories
router.post('/', ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id
    await Story.create(req.body)
    res.redirect('/dashboard')
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

// @desc    Show all stories
// @route   GET /stories
router.get('/', ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ status: 'public' })
      .populate('user')
      .sort({ createdAt: 'desc' })
      .lean()

    res.render('stories/index', {
      stories,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

// @desc    Show single story
// @route   GET /stories/:id
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).populate('user').lean()

    if (!story) {
      return res.render('error/404')
    }

    if (story.user._id != req.user.id && story.status == 'private') {
      res.render('error/404')
    } else {
      res.render('stories/show', {
        story,
      })
    }
  } catch (err) {
    console.error(err)
    res.render('error/404')
  }
})

// @desc    Show edit page
// @route   GET /stories/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
  try {
    const story = await Story.findOne({
      _id: req.params.id,
    }).lean()

    if (!story) {
      return res.render('error/404')
    }

    if (story.user != req.user.id) {
      res.redirect('/stories')
    } else {
      res.render('stories/edit', {
        story,
      })
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    Update story
// @route   PUT /stories/:id
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).lean()

    if (!story) {
      return res.render('error/404')
    }

    if (story.user != req.user.id) {
      res.redirect('/stories')
    } else {
      story = await Story.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      })

      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    Delete story
// @route   DELETE /stories/:id
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).lean()

    if (!story) {
      return res.render('error/404')
    }

    if (story.user != req.user.id) {
      res.redirect('/stories')
    } else {
      await Story.remove({ _id: req.params.id })
      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    User stories
// @route   GET /stories/user/:userId
router.get('/user/:userId', ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({
      user: req.params.userId,
      status: 'public',
    })
      .populate('user')
      .lean()

    res.render('stories/index', {
      stories,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

module.exports = router
