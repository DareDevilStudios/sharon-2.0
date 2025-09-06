export default async function handler(req, res) {
  // Check for secret to confirm this is a valid request
  if (req.query.secret !== process.env.REVALIDATE_SECRET) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  try {
    const { tags } = req.body;

    if (!tags || !Array.isArray(tags)) {
      return res.status(400).json({ message: 'Tags array is required' });
    }

    // Revalidate pages with matching tags
    const revalidationPromises = tags.map(async (tag) => {
      try {
        // Revalidate homepage if products tag is included
        if (tag === 'products') {
          await res.revalidate('/');
        }
        
        // Revalidate specific category pages
        const categoryName = tag.replace(/\s+/g, '-');
        await res.revalidate(`/${categoryName}`);
        
        return { tag, revalidated: true };
      } catch (error) {
        console.error(`Error revalidating tag ${tag}:`, error);
        return { tag, revalidated: false, error: error.message };
      }
    });

    const results = await Promise.all(revalidationPromises);
    
    return res.json({
      revalidated: true,
      results,
      message: `Revalidated ${results.filter(r => r.revalidated).length} pages`
    });
  } catch (err) {
    return res.status(500).json({ message: 'Error revalidating' });
  }
}
