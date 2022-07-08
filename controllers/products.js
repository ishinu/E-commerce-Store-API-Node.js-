const Product = require('../models/product')

const getAllProductsStatic = async (req,res) =>{
    // const products = await Product.find({})
    // const products = await Product.find({ featured : true})
    // const products = await Product.find({ 
    //     featured : true
    // })
    // const products = await Product.find({ 
    //     name : 'vase table' 
    // })
    // const products = await Product.find({ 
    //     page : '2'
    // })
    // const products = await Product.find({ 
    //     name : '2' 
    // })
    // const products = await Product.find({ 
    //     name : 'albany sectional' 
    // })
    // const search = 'a'
    // const products = await Product.find({ 
    //     name : {$regex:search,$options:'i'}
    // })
    // const products = await Product.find({ }).sort('name')
    // const products = await Product.find({ }).sort('-name price')
    // const products = await Product.find({ }).select('name price') 
    // const products = await Product.find({ }).select('name price').limit(4) 
    // const products = await Product.find({ }).sort('name').select('name price').limit(4)
    // const products = await Product.find({ }).sort('name').select('name price').limit(4).skip(1)
    // const products = await Product.find({}).sort('name').select('name price')
    // const products = await Product.find({ price:{ $gt:30 } }).sort('name').select('name price')
    const products = await Product.find({ price:{ $gt:30 } }).sort('price').select('name price')
    // throw new Error('testing async errors')
    // res.status(200).json({msg:'products testing route'})
    // res.status(200).json({ products })
    res.status(200).json({  nbHits:products.length,products })

}

const getAllProducts = async (req,res) =>{
    // console.log(req.query)
    // const {featured} = req.query
    // const {featured,company} = req.query
    // const {featured,company,search} = req.query
    // const {featured,company,name} = req.query
    // const {featured,company,name,sort} = req.query
    // const {featured,company,name,sort,fields} = req.query
    const {featured,company,name,sort,fields,numericFilters} = req.query
    const queryObject = {} 
    if(featured){
        queryObject.featured = featured === 'true'? true : false
    }
    if(company){
        queryObject.company = company
    }
    if(name){
        // queryObject.name = name
        queryObject.name = {$regex:name,$options:'i'}
    }
    if(numericFilters){
        const operatorMap = {
            '>':'$gt',
            '>=':'$gte',
            '=':'$eq',
            '<':'$lt',
            '<=':'$lte'
        }
        const regEx = /\b(<|>|>=|=|<|<=)\b/g
        let filters = numericFilters.replace(regEx,(match)=>`-${operatorMap[match]}-`)
        // console.log(numericFilters)
        // console.log(filters)
        const options =  ['price','rating']
        filters = filters.split(',').forEach((item)=>{
            const [field,operator,value] = item.split('-')
            if(options.includes(field)){
                queryObject[field] = {[operator]:Number(value)}
            }
        })
    }
    console.log(queryObject)
    // const products = await Product.find(queryObject)
    // let products = await Product.find(queryObject)
    let result = Product.find(queryObject)
    if(sort){
        // products = products.sort()
        // console.log(sort)
        const sortList = sort.split(',').join(' ');
        result = result.sort(sortList)
    }
    else{
        // result = result.sort()
        result = result.sort('createAt')
    }
    if(fields){
        const fieldsList = fields.split(',').join(' ')
        result = result.select(fieldsList)
    }
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page -1) * limit;

    result = result.skip(skip).limit(limit)

    const products = await result
    // const products = await Product.find(req.query);
    // res.status(200).json({msg:'products route'})
    res.status(200).json({ nbHits:products.length,products  })
}

module.exports = {
    getAllProducts,
    getAllProductsStatic
}