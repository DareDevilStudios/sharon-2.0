export default async function handler(req, res) {
  // Security check - only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { paths } = req.body;

    // Validate input
    if (!paths || !Array.isArray(paths)) {
      return res.status(400).json({ 
        message: 'Paths array must be provided' 
      });
    }

    // Invalidate by paths - this works with Next.js ISR
    const revalidationResults = [];
    for (const path of paths) {
      try {
        await res.revalidate(path);
        revalidationResults.push({ path, success: true });
        console.log(`Cache invalidated for path: ${path}`);
      } catch (pathError) {
        revalidationResults.push({ path, success: false, error: pathError.message });
        console.error(`Failed to invalidate path ${path}:`, pathError);
      }
    }

    const successCount = revalidationResults.filter(r => r.success).length;
    const failureCount = revalidationResults.length - successCount;

    return res.status(200).json({ 
      message: `Cache invalidation completed: ${successCount} successful, ${failureCount} failed`,
      revalidated: successCount > 0,
      results: revalidationResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Cache invalidation error:', error);
    return res.status(500).json({ 
      message: 'Failed to invalidate cache',
      error: error.message 
    });
  }
}