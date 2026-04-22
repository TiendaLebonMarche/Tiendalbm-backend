import { Client } from 'pg'

async function checkImages() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/medusa'
  })
  
  try {
    await client.connect()
    const res = await client.query('SELECT id, url FROM image LIMIT 10')
    console.log('Product Images:')
    console.table(res.rows)
    
    const products = await client.query('SELECT id, title, thumbnail FROM product LIMIT 10')
    console.log('Products:')
    console.table(products.rows)
    
  } catch (err) {
    console.error('Error connecting to database:', err)
  } finally {
    await client.end()
  }
}

checkImages()
