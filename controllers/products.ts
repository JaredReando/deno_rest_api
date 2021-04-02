import { Client } from '../deps.ts'
import { Product } from '../types.ts';
import { dbCreds } from '../config.ts';

// Init client
const client = new Client(dbCreds);

// @desc    Get all products
// @route   GET /api/v1/products
const getProducts = async ({response}: {response: any}) => {
    try {
        await client.connect()
        const result = await client.queryObject("SELECT * FROM products")
        console.log('result: ', result)
        response.status = 200;
        response.body = {
            success: true,
            data: result.rows,
        }
    } catch(err) {
        response.status = 500;
        response.body = {
            success: false,
            msg: "Mysterious DB error: " + err.toString()
        }
    } finally {
        client.end()
    }
}

// @desc    Get a single product
// @route   GET /api/v1/products/:id
const getProduct = async ({response, params}: {params: {id: string}, response: any}) => {

    try{
        await client.connect();
        const result = await client.queryObject("SELECT * FROM products WHERE id = $1", params.id)
        if (result.rows.length === 0) {
            response.status = 404;
            response.body = {
                success: false,
                msg: `No product with the id of ${params.id}`
            }
            return 
        } else {
            response.status = 200;
            response.body = {
                success: true,
                data: result.rows
            }
        }

    } catch(err) {
        response.code = 500
        response.body = {
            success: false,
            msg: "Uh Oh. Error time: " + err.toString()
        }
    } finally {
        client.end()
    }
}

// @desc    Add a single product
// @route   POST /api/v1/products
const addProduct = async ({request, response}: {request: any, response: any}) => {
    const body = await request.body();
    const product: Product = await body.value


    if(!request.hasBody) {
        response.status = 400
        response.body = {
            success: false,
            msg: "No data provided"
        }
    } else {
        try {
            await client.connect();

            const result = await client.queryObject("INSERT INTO products(name, description, price) VALUES($1,$2,$3)", product.name, product.description, product.price)
            response.status = 201;
            response.body = {
                success: true,
                data: product,
            }
        } catch (err) {
            response.status = 500
            response.body = {
                success: false,
                msg: "Database error: " + err.toString()
            }
        } finally {
            await client.end()
        }

    }
}

// @desc    Update a single product
// @route   PUT /api/v1/products/:id
const updateProduct = async ({params, request, response}: {params: {id: string}, request: any, response: any}) => {
    const productId = params.id;
    //TODO: this isn't easy to understand. I should make this logic more explicit
    await getProduct({params: {id: productId}, response})

    if(response.status === 404) {
        response.status = 404;
        response.body = {
            success: false,
            //borrowing this from the returned 'getProduct' call
            msg: response.body.msg
        }
    } else {
        const body = await request.body()
        const product = {...response.body.data[0] , ...await body.value};

        if(!request.hasBody) {
            response.status = 400
            response.body = {
                success: false,
                msg: "No data provided"
            }
        } else {
            try {
                await client.connect();
    
                const result = await client.queryObject("UPDATE products SET name=$1, description=$2, price=$3 WHERE id=$4", product.name, product.description, product.price, params.id);

                response.status = 200;
                response.body = {
                    success: true,
                    data: product,
                }
            } catch (err) {
                response.status = 500
                response.body = {
                    success: false,
                    msg: "Database error: " + err.toString()
                }
            } finally {
                await client.end()
            }

        }
    }
}

// @desc    Delete a single product
// @route   DELETE /api/v1/products/:id
const deleteProduct = async ({params, response}: {params: {id: string}, response: any}) => {
    await getProduct({params: {id: params.id}, response});

    if(response.status === 404) {
        response.status = 404
        response.body = {
            success: false,
            msg: response.body.msg
        }
    }
    try {
        await client.connect()
        const result = await client.queryObject("DELETE FROM products WHERE id=$1", params.id)

        response.status = 200;
        response.body = {
            success: true,
            msg: `Product with id ${params.id} has been deleted`
        }

    } catch (err) {
        response.code = 500;
        response.body = {
            success: false,
            msg: 'Error trying to delete: ' + err.toString()
        }
    } finally {
        client.end()
    }
}

export { getProducts, getProduct, addProduct, updateProduct, deleteProduct }