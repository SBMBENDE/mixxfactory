// Automated test for News Flash admin API
const fetch = require('node-fetch')

const API = 'http://localhost:3000/api/admin/news-flash'

async function run() {
  // 1. Create
  const createRes = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Automated News',
      content: 'This is a news flash created by automation.',
      published: false,
    }),
  })
  const createData = await createRes.json()
  if (!createRes.ok)
    throw new Error('Create failed: ' + JSON.stringify(createData))
  const id = createData.news._id
  console.log('Created:', createData.news)

  // 2. List
  const listRes = await fetch(API)
  const listData = await listRes.json()
  if (!listRes.ok) throw new Error('List failed: ' + JSON.stringify(listData))
  console.log(
    'List:',
    listData.news.map((n) => n.title)
  )

  // 3. Get single
  const getRes = await fetch(`${API}/${id}`)
  const getData = await getRes.json()
  if (!getRes.ok) throw new Error('Get failed: ' + JSON.stringify(getData))
  console.log('Get:', getData.news.title)

  // 4. Edit
  const editRes = await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Edited Automated News',
      content: 'Updated content.',
      published: false,
    }),
  })
  const editData = await editRes.json()
  if (!editRes.ok) throw new Error('Edit failed: ' + JSON.stringify(editData))
  console.log('Edited:', editData.news.title)

  // 5. Publish
  const publishRes = await fetch(`${API}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ published: true }),
  })
  const publishData = await publishRes.json()
  if (!publishRes.ok)
    throw new Error('Publish failed: ' + JSON.stringify(publishData))
  console.log('Published:', publishData.news.published)

  // 6. Delete
  const deleteRes = await fetch(`${API}/${id}`, { method: 'DELETE' })
  const deleteData = await deleteRes.json()
  if (!deleteRes.ok)
    throw new Error('Delete failed: ' + JSON.stringify(deleteData))
  console.log('Deleted:', deleteData.success)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
