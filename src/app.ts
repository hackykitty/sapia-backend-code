import db from '@src/utils/db'
import logger from '@src/utils/logger'
import {createServer} from '@src/utils/server'

db.open()
  .then(() => createServer())
  .then(server => {
    server.listen(3000, () => {
      logger.info(`Listening on http://localhost:3000`)
    })
  })
  .catch(err => {
    logger.error(`Error: ${err}`)
  })
