import { createClient } from 'pg'

async function fixImages() {
  const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/medusa'
  const client = new createClient({ connectionString })
  
  try {
    await client.connect()
    console.log('Connected to database to fix image URLs...')

    // Define the wrong prefix and the correct one
    // Assuming MinIO on localhost:9000
    const oldPrefix = 'http://localhost/medusa-media/'
    const newPrefix = 'http://localhost:9000/medusa-media/'

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
    
  } catch (err) {
    console.error('Error fixing image URLs:', err)
  } finally {
    await client.end()
  }
}

fixImages()
