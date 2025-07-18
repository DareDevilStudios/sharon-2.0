import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from "../firebase";
import { addDoc, collection } from 'firebase/firestore';
import { openDB } from 'idb';


const productsRef = collection(db, "products");
const DB_NAME = 'sharonDB';
const STORE_CATEGORIES = 'categories';
const STORE_PRODUCTS = 'products'
const PENDING_CATEGORIES_STORE = 'pendingCategories'
const PENDING_PRODUCTS_STORE = 'pendingProducts'

export async function getDB() {
  return openDB(DB_NAME, 4, {
    upgrade(dbe) {
      if (!dbe.objectStoreNames.contains(STORE_CATEGORIES)) {
        dbe.createObjectStore(STORE_CATEGORIES, { keyPath: 'id' });
      }
      if (!dbe.objectStoreNames.contains(STORE_PRODUCTS)) {
        dbe.createObjectStore(STORE_PRODUCTS, { keyPath: 'id' });
      }

      if (!dbe.objectStoreNames.contains(PENDING_CATEGORIES_STORE)) {
        dbe.createObjectStore(PENDING_CATEGORIES_STORE, { keyPath: 'id', autoIncrement: true });
      }
      if (!dbe.objectStoreNames.contains(PENDING_PRODUCTS_STORE)) {
        dbe.createObjectStore(PENDING_PRODUCTS_STORE, { keyPath: 'categoryName' });
      }
    }
  });
}

export async function saveCategoriesToDB(products) {

  const db = await getDB();
  const tx = db.transaction(STORE_CATEGORIES, 'readwrite');
  tx.store.clear()
  for (const product of products) {
    await tx.store.put(product);
  }
  await tx.done;

}

export async function getCategoriesFromDB() {
  const db = await getDB();
  return await db.getAll(STORE_CATEGORIES);
}




export async function saveProductsToDB(products) {
  try {

    console.log("products reached here", products);

    const db = await getDB();
    const tx = db.transaction(STORE_PRODUCTS, 'readwrite');
    // for (const product of products) {
    //   await tx.store.put(product);
    // }


    for (const array of Object.values(products)) {
      for (const obj of array) {
        await tx.store.put(obj);
      }
    }
    await tx.done;

    console.log("HERE....");
  }
  catch (err) {
    console.log("ERROR IN ADDING PRODUCTS DATA TO INDEXED DB", err);

  }
}




export async function getProductsFromDB() {
  const db = await getDB();
  return await db.getAll(STORE_PRODUCTS);
}



export async function pendingCategories(cat) {
  try {
    const db = await getDB();
    const tx = db.transaction(PENDING_CATEGORIES_STORE, 'readwrite');
    await tx.store.put(cat)
    await tx.done;

    alert(`category ${cat.name}added sucessfully`)
  } catch (error) {
    console.log("Error in Adding pending products", error);

    alert("Error in Adding pending products")
  }

}

export async function removePendingCategory(categoryId) {
  try {
    const db = await getDB();
    const tx = db.transaction(PENDING_CATEGORIES_STORE, 'readwrite');
    await tx.store.delete(categoryId);
    await tx.done;
  } catch (error) {
    console.error("Error removing pending category:", error);
  }
}

export async function removePendingProducts(cateName){
  try {
    const db = await getDB();
    const tx = db.transaction(PENDING_PRODUCTS_STORE, 'readwrite');
    await tx.store.delete(cateName);
    await tx.done;

  } catch (error) {
    console.error("Error removing pending category:", error);
  }
}



export async function syncPendingCategories() {
  try {
    const db = await getDB();
    const tx = db.transaction(PENDING_CATEGORIES_STORE, 'readonly');
    const pendingCategories = await tx.store.getAll();
    
    for (const category of pendingCategories) {
      try {
        // Upload file to Firebase Storage
        const imageRef = ref(storage, `products/${category.name}`);
        await uploadBytes(imageRef, category.productUrl);
        const downloadURL = await getDownloadURL(imageRef);
        
        // Add to Firestore
        await addDoc(productsRef, {
          name: category.name,
          productUrl: downloadURL,
        });
        
        // Remove from pending after successful upload
        await removePendingCategory(category.id);
        alert(`Successfully added all pending category${category.name}`)
        console.log(`Synced category: ${category.name}`);
      } catch (error) {
        console.error(`Failed to sync category ${category.name}:`, error);
        // Keep it in pending for retry later
      }
    }
  } catch (error) {
    console.error("Error syncing pending categories:", error);
  }
}


// export async function getAllPendingCategories() {
//   try {
//     const db = await getDB();
//     const tx = db.transaction(PENDING_CATEGORIES_STORE, 'readonly');
//     const categories = await tx.store.getAll();
//     return categories;
//   } catch (error) {
//     console.error("Error getting pending categories:", error);
//     return [];
//   }
// }
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function getAllPendingCategories() {
  try {
    const db = await getDB();
    const tx = db.transaction(PENDING_CATEGORIES_STORE, 'readonly');
    const categories = await tx.store.getAll();
    
    // Process each category to convert File objects to base64 URLs
    const processedCategories = await Promise.all(
      categories.map(async (category) => {
        let imageUrl = null;
        
        // Check if productUrl is a File object
        if (category.productUrl && category.productUrl instanceof File) {
          try {
            // Convert File to base64 data URL
            imageUrl = await fileToBase64(category.productUrl);
           
            
          } catch (error) {
            console.error("Error converting file to base64:", error);
            imageUrl = null;
          }
        }
        
        return {
          ...category,
          offlineImage: imageUrl // This will work offline
        };
      })
    );
    
    return processedCategories;
  } catch (error) {
    console.error("Error getting pending categories:", error);
    return [];
  }
}


export async function pendingProducts(products, categoryname) {
  try {
    const db = await getDB();
    const tx = db.transaction(PENDING_PRODUCTS_STORE, 'readwrite');
    
    // First, check if category already exists
    const existingData = await tx.store.get(categoryname);
    
    let finalProducts;
    
    if (existingData) {
      // Category exists - merge new products with existing ones
      const existingProducts = existingData.products || [];
      finalProducts = [...existingProducts, ...products];
      
      console.log(`Merging ${products.length} new products with ${existingProducts.length} existing products`);
    } else {
      // Category doesn't exist - use new products as is
      finalProducts = products;
      console.log(`Creating new category with ${products.length} products`);
    }
    
    // Store the merged/new data
    await tx.store.put({
      categoryName: categoryname,
       finalProducts
    });
    
    await tx.done;
    
    const message = existingData 
      ? `Products merged with existing ${categoryname} category successfully`
      : `New category ${categoryname} created successfully`;
    
    alert(message);
    
  } catch (error) {
    console.log("Error in Adding pending products", error);
    alert("Error in Adding pending products");
  }
}

export async function getPendingProducts(categoryName) {
  const db = await getDB();
  const result = await db.get(PENDING_PRODUCTS_STORE, categoryName);
  console.log(result);
  
  // If result exists and has finalProducts, iterate through them
  if (result && result.finalProducts) {
    const productsArray = [];
    
    // Use for...of to handle async operations sequentially
    for (const product of result.finalProducts) {
      let imageUrl=null
      try {
        // Convert File to base64 data URL
        imageUrl = await fileToBase64(product.productUrl);
       
        
      } catch (error) {
        console.error("Error converting file to base64:", error);
        imageUrl = null;
      }
      
      // Create object with product data and offlineImage
      const productData = {
        name: product.name,
        price: product.price,
        productUrl: product.productUrl, // Original image URL
        offlineImage: imageUrl // Base64 converted URL from productUrl// Result from async function
      };
      
      productsArray.push(productData);
    }
    
    console.log('Products Array:', productsArray);
    return productsArray;
  }
  
  return [];
}


export async function syncPendingProducts(){
  try {
    
    const dataBase = await getDB();
    const tx = dataBase.transaction(PENDING_PRODUCTS_STORE, 'readonly');
    const pendingProducts = await tx.store.getAll();
    
    for (const products of pendingProducts) {
      try {
      
       
        for (const product of products.finalProducts) {
          const imageRef2 = ref(storage, `${products.categoryName}/${product.name || (products.categoryName + '-' + (i + 1))}`);
          const eachProducts = collection(db, products.categoryName);
          const snapshot = await uploadBytes(imageRef2,product.productUrl);
          const url = await getDownloadURL(snapshot.ref);
          await addDoc(eachProducts, { name:products.categoryName,productName: product.name, price:product.price, productUrl: url });
          alert(`successfully added products${product.name} of category ${products.categoryName}`)
        }
        await removePendingProducts(products.categoryName)
      } catch (error) {
        console.error(`Failed to sync category ${products.categoryName}:`, error);
      }
    }
  } catch (error) {
    console.error("Error syncing pending categories:", error);
  }
}

export async function getAllPendingProducts(){
 try{
  const db = await getDB();
  const tx = db.transaction(PENDING_PRODUCTS_STORE, 'readonly');
  const products = await tx.store.getAll();
  return products
 }catch(err){
   console.log("Fetching pending products from indexed db",err);
 }
  
}