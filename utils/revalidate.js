// Utility function to trigger revalidation
export const revalidatePages = async (tags) => {
  try {
    const response = await fetch('/api/revalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tags,
        secret: process.env.NEXT_PUBLIC_REVALIDATE_SECRET || 'your-secret-key'
      }),
    });

    if (!response.ok) {
      throw new Error(`Revalidation failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Revalidation result:', result);
    return result;
  } catch (error) {
    console.error('Error triggering revalidation:', error);
    throw error;
  }
};

// Helper function to get revalidation tags for different operations
export const getRevalidationTags = {
  // When a category is added/updated/deleted
  categoryChange: (categoryName) => ['products'],
  
  // When products are added/updated/deleted in a category
  productChange: (categoryName) => ['products', categoryName],
  
  // When bulk operations are performed
  bulkChange: (categoryNames) => ['products', ...categoryNames],
};
