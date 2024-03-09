import React, { useState, useEffect } from 'react';
import axios from 'axios';
import md5 from 'md5';

const API_URL = 'https://api.valantis.store:41000/';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [nameFilter, setNameFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');


  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  const fetchProducts = async () => {
    try {
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const authString = md5(`Valantis_${timestamp}`);
      const config = {
        headers: {
          'X-Auth': authString
        }
      };

      let action = 'get_ids';
      let params = {
        "offset": (currentPage - 1) * 50,
        "limit": 50
      };

      if (nameFilter || priceFilter || brandFilter) {
        action = 'filter';
        params = {};

        if (nameFilter) {
          params.product = nameFilter;
        }

        if (priceFilter) {
          params.price = parseFloat(priceFilter);
        }

        if (brandFilter) {
          params.brand = brandFilter;
        }
      }

      const response = await axios.post(API_URL, {
        action,
        params
      }, config);

      const productIds = response.data.result;
      const uniqueProductIds = [];

      productIds.forEach(product => {
          if (!uniqueProductIds.some(item => item === product)) {
              uniqueProductIds.push(product);
          }
      });
      
      const productDetails = await fetchProductDetails(uniqueProductIds);

      setProducts(productDetails);
      
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchProductDetails = async (ids) => {
    try {
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const authString = md5(`Valantis_${timestamp}`);
      const config = {
        headers: {
          'X-Auth': authString
        }
      };

      const response = await axios.post(API_URL, {
        action: 'get_items',
        params: { ids }
      }, config);

      return response.data.result;
    } catch (error) {
      console.error('Error fetching product details:', error);
      throw error;
    }
  };

  const nextPage = () => {
    setCurrentPage(prevPage => prevPage + 1);
  };

  const prevPage = () => {
    setCurrentPage(prevPage => prevPage - 1);
  };

  const handleFilter = () => {
    setCurrentPage(1);
    fetchProducts();
  };

  return (
    <div className="product-list-container">
      <h1>Product List</h1>
      <div className="filter-section">
        <label htmlFor="nameFilter">Name:</label>
        <input 
          type="text" 
          id="nameFilter" 
          value={nameFilter} 
          onChange={(e) => setNameFilter(e.target.value)} 
        />
        <label htmlFor="priceFilter">Price:</label>
        <input 
          type="text" 
          id="priceFilter" 
          value={priceFilter} 
          onChange={(e) => setPriceFilter(e.target.value)} 
        />
        <label htmlFor="brandFilter">Brand:</label>
        <input 
          type="text" 
          id="brandFilter" 
          value={brandFilter} 
          onChange={(e) => setBrandFilter(e.target.value)} 
        />
        <button onClick={handleFilter}>Filter</button>
      </div>
      <table className="product-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Brand</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>{product.product}</td>
              <td>{product.price}</td>
              <td>{product.brand}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button onClick={prevPage} disabled={currentPage === 1}>Previous Page</button>
        <button onClick={nextPage}>Next Page</button>
      </div>
    </div>
  );
};

export default ProductList;
