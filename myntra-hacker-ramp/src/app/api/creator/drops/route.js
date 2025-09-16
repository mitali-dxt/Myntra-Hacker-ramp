import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from "@/lib/db";
import Drop from '@/models/Drop';
import Creator from '@/models/Creator';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Middleware to verify creator token
function verifyCreatorToken(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No authorization header or invalid format');
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    if (decoded.type !== 'creator') {
      console.log('Token type is not creator:', decoded.type);
      return null;
    }
    return decoded;
  } catch (error) {
    console.log('Token verification error:', error.message);
    return null;
  }
}

// GET: Fetch creator's drops
export async function GET(request) {
  try {
    await connectToDatabase();

    const decoded = verifyCreatorToken(request);
    if (!decoded) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Fetching drops for creator ID:', decoded.creatorId);
    
    const drops = await Drop.find({ creator_id: decoded.creatorId })
      .sort({ createdAt: -1 });

    console.log('Found drops:', drops.length);
    console.log('Drop details:', drops.map(d => ({ id: d._id, title: d.title, creator_id: d.creator_id })));

    return NextResponse.json(drops);
  } catch (error) {
    console.error('Error fetching creator drops:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create new drop
export async function POST(request) {
  try {
    await connectToDatabase();

    const decoded = verifyCreatorToken(request);
    if (!decoded) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Received request body:', JSON.stringify(body, null, 2));
    
    const {
      title,
      description,
      launch_datetime,
      products = [],
      tags = [],
      collection_image = '',
      is_featured = false,
      commission_rate = 15,
      status = 'draft'
    } = body;

    console.log('Extracted products:', JSON.stringify(products, null, 2));
    console.log('Products length:', products.length);
    
    // Log each product to see what fields are present
    products.forEach((product, index) => {
      console.log(`Product ${index}:`, {
        name: product.name,
        stock_quantity: product.stock_quantity,
        price: product.price,
        hasName: !!product.name,
        hasStockQuantity: !!product.stock_quantity,
        allKeys: Object.keys(product)
      });
    });

    // Validate required fields
    if (!title || !description || !launch_datetime) {
      return NextResponse.json(
        { message: 'Title, description, and launch date are required' },
        { status: 400 }
      );
    }

    if (products.length === 0) {
      return NextResponse.json(
        { message: 'At least one product is required' },
        { status: 400 }
      );
    }

    // Validate and clean up products data
    let validatedProducts;
    try {
      validatedProducts = products.map((product, index) => {
        if (!product.name || product.name.trim() === '') {
          throw new Error(`Product ${index} is missing name field`);
        }
        if (!product.stock_quantity && product.stock_quantity !== 0) {
          throw new Error(`Product ${index} is missing stock_quantity field`);
        }
        if (!product.price && product.price !== 0) {
          throw new Error(`Product ${index} is missing price field`);
        }

        return {
          name: String(product.name).trim(),
          description: String(product.description || ''),
          price: Number(product.price),
          original_price: Number(product.original_price || product.price),
          image_url: String(product.image_url || ''),
          category: String(product.category || ''),
          sizes: Array.isArray(product.sizes) ? product.sizes : [],
          colors: Array.isArray(product.colors) ? product.colors : [],
          stock_quantity: Number(product.stock_quantity),
          sold_quantity: Number(product.sold_quantity || 0),
          is_exclusive: Boolean(product.is_exclusive || false),
          limited_quantity: Boolean(product.limited_quantity || false),
          rating: Number(product.rating || 0)
        };
      });
    } catch (validationError) {
      console.error('Product validation error:', validationError.message);
      return NextResponse.json(
        { message: `Product validation failed: ${validationError.message}` },
        { status: 400 }
      );
    }

    console.log('Validated products:', JSON.stringify(validatedProducts, null, 2));

    // Calculate price range from validated products
    const prices = validatedProducts.map(p => p.price || 0);
    const price_range = {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };

    // Get creator info
    const creator = await Creator.findById(decoded.creatorId);
    if (!creator) {
      return NextResponse.json(
        { message: 'Creator not found' },
        { status: 404 }
      );
    }

    // Create new drop with validated products
    const drop = new Drop({
      title,
      description,
      creator_id: decoded.creatorId,
      creator_name: creator.name,
      creator_image: creator.profile_image,
      launch_datetime,
      products: validatedProducts,  // Use validated products instead of raw products
      tags,
      collection_image,
      is_featured,
      commission_rate,
      status,
      price_range,
      total_items: validatedProducts.length,
      total_stock: validatedProducts.reduce((sum, p) => sum + (p.stock_quantity || 0), 0),
      sold_count: 0,
      views: 0,
      engagement_rate: 0
    });

    console.log('About to save drop with products:', drop.products.length);
    await drop.save();
    console.log('Drop saved successfully');

    // Update creator's total drops count
    await Creator.findByIdAndUpdate(
      decoded.creatorId,
      { $inc: { total_drops: 1 } }
    );

    return NextResponse.json(drop, { status: 201 });
  } catch (error) {
    console.error('Error creating drop:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}