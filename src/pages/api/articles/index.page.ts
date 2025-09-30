import type { NextApiRequest, NextApiResponse } from 'next'
import { Blog, getAllBlogs, getCategoriesFromBlogs } from 'src/utils/blogs'
import { getPageViewCount } from 'src/utils/gadata'

export type ArticlesResponse = {
  total?: number
  data?: Blog[] | null
  populars?: Blog[]
  categories?: string[]
  current?: number
  pageSize?: number
  message: string
}


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ArticlesResponse>
) {
  if (req.method === 'GET') {
    const pageSize = 24;
    const query = req.query;
    const sortBy = query.sort_by as string
    const page = parseInt(query.page as string || "1");
    const locale = query.locale as string ?? "en"

    const pageViewCount = await getPageViewCount('/knowledge-base/')
    const posts = await getAllBlogs(sortBy, locale).then(post =>
      post.map(({ content, ...p }) => ({
        ...p,
        // omit article content to reduce props size
        content: "",
        pageView: pageViewCount[p.slug] ?? 0,
      })),
    )
    const populars = posts.filter(post => post.category?.toLowerCase().includes('popular'))
    const categories = getCategoriesFromBlogs(posts)
    res.status(200).json({
      total: posts.length,
      data: posts.slice(pageSize * (page - 1), pageSize * page),
      populars,
      categories,
      current: page,
      pageSize,
      message: "",
    })
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}