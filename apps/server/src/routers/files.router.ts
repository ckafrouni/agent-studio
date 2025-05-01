import { NoSuchKey } from '@aws-sdk/client-s3'
import { Hono } from 'hono'
import type { HonoEnv } from '@/hono.types'
import { documentService } from '@/lib/services/document.service'
import { fileManagementService } from '@/lib/services/file-management.service'
import { fileStorageService } from '@/lib/services/file-storage.service'

const filesRouter = new Hono<HonoEnv>()
	.post('/upload', async (c) => {
		try {
			const user = c.get('user')
			if (!user?.id) {
				return c.json({ error: 'Unauthorized' }, 401)
			}
			const userId = user.id

			const formData = await c.req.formData()
			const file = formData.get('file') as File | null

			if (!file) {
				return c.json({ error: 'No file uploaded.' }, 400)
			}

			const fileBuffer = Buffer.from(await file.arrayBuffer())

			const result = await fileManagementService.uploadAndProcessDocument(
				userId,
				fileBuffer,
				file.name,
				file.type,
				file.size,
			)

			return c.json(result, 201)
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Unknown error'
			return c.json(
				{
					error: 'Failed to upload or process file.',
					message,
				},
				500,
			)
		}
	})

	.get('/', async (c) => {
		const user = c.get('user')
		if (!user?.id) {
			return c.json({ error: 'Unauthorized' }, 401)
		}
		const userId = user.id

		try {
			const result = await documentService.listDocuments(userId)
			return c.json(result)
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to list documents.'
			return c.json({ error: message }, 500)
		}
	})

	.post('/search', async (c) => {
		try {
			const user = c.get('user')
			if (!user?.id) {
				return c.json({ error: 'Unauthorized' }, 401)
			}
			const userId = user.id

			const body = await c.req.json<{ query: string; k?: number }>()
			const { query, k } = body
			const results = await documentService.searchDocuments(userId, query, k)
			return c.json(results)
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Search failed.'
			return c.json({ error: message }, 500)
		}
	})

	.get('/content/:source', async (c) => {
		const source = c.req.param('source')
		if (!source) {
			return c.json({ error: 'Source parameter is required.' }, 400)
		}
		try {
			const fileData = await fileStorageService.getFileFromS3(source)

			const contentType = fileData.contentType

			c.header('Content-Type', contentType ?? 'application/octet-stream')
			c.header('Content-Disposition', `inline; filename="${source}"`)

			return c.body(fileData.buffer)
		} catch (error: unknown) {
			if (error instanceof NoSuchKey) {
				return c.notFound()
			}
			const message = error instanceof Error ? error.message : 'Unknown error'
			return c.json({ error: 'Failed to retrieve file', message }, 500)
		}
	})

	.delete('/:source', async (c) => {
		try {
			const user = c.get('user')
			if (!user?.id) {
				return c.json({ error: 'Unauthorized' }, 401)
			}
			const userId = user.id

			const source = c.req.param('source')
			const result = await fileManagementService.deleteDocument(userId, source)
			return c.json(result)
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to delete document.'
			return c.json({ error: message }, 500)
		}
	})

export { filesRouter }
