import { Client } from 'pg'
import { loadEnv } from '@medusajs/framework/utils'
loadEnv(process.env.NODE_ENV || 'development', process.cwd())

async function fixImages() {
  const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/medusa'
  const client = new Client({ connectionString })
  
  try {
    await client.connect()
    console.log('Connected to database to fix image URLs...')

    // Define the wrong prefixes and the correct one (moving to local storage)
    const prefixes = [
      { old: 'http://localhost/medusa-media/', new: 'http://localhost:9000/static/' },
      { old: 'http://localhost:9000/medusa-media/', new: 'http://localhost:9000/static/' }
    ]

    for (const { old: oldPrefix, new: newPrefix } of prefixes) {
      console.log(`Migrating from ${oldPrefix} to ${newPrefix}...`)

    // Update image table
    const res = await client.query(`
      UPDATE image 
      SET url = REPLACE(url, $1, $2)
      WHERE url LIKE $3
    `, [oldPrefix, newPrefix, `${oldPrefix}%`])
    
    console.log(`Updated ${res.rowCount} entries in 'image' table.`)

    // Update product thumbnails
    const resThumb = await client.query(`
      UPDATE product 
      SET thumbnail = REPLACE(thumbnail, $1, $2)
      WHERE thumbnail LIKE $3
    `, [oldPrefix, newPrefix, `${oldPrefix}%`])

    console.log(`Updated ${resThumb.rowCount} product thumbnails.`)
    }
    
  } catch (err) {
    console.error('Error fixing image URLs:', err)
  } finally {
    await client.end()
  }
}

fixImages()
