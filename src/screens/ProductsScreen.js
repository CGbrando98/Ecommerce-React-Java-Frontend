import React, { useEffect } from 'react'
import { LinkContainer } from 'react-router-bootstrap'
import { Table, Button, Row, Col } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Message from '../components/Message'
import Loader from '../components/Loader'
import {
  fetchProducts,
  selectProducts,
  selectPages,
  selectProductsStatus,
  selectProductsError,
} from '../redux/productsSlice'
import {
  resetProduct,
  createProduct,
  deleteProduct,
  selectProduct,
  selectProductStatus,
  selectProductError,
} from '../redux/productSlice'
import { selectUserAuth, selectUserAuthError } from '../redux/userAuthSlice'
import { useParams } from 'react-router-dom'
import Paginate from '../components/Paginate'
import tokenCheck from '../tokenExchange'

const ProductsScreen = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { pageNumber } = useParams()
  const page = pageNumber ? pageNumber : 1

  const user = useSelector(selectUserAuth)
  const userError = useSelector(selectUserAuthError)
  const token = user.access_token
  const refreshToken = user ? user.refresh_token : null
  const userId = user.userInfo ? user.userInfo.id_user : null
  const role = user.userInfo ? user.userInfo.role : null

  const products = useSelector(selectProducts)
  const pages = useSelector(selectPages)
  const productsStatus = useSelector(selectProductsStatus)
  const productsError = useSelector(selectProductsError)

  const product = useSelector(selectProduct)
  const productStatus = useSelector(selectProductStatus)
  const productError = useSelector(selectProductError)

  useEffect(() => {
    if (!userId) {
      navigate('/login')
    } else if (
      user.userInfo &&
      role === 'ROLE_ADMIN' &&
      !(productError?.substring(0, 29) === 'Access: The Token has expired')
    ) {
      dispatch(fetchProducts(page))
    }

    if (productStatus === 'product created') {
      navigate(`/admin/products/${product.id_product}/edit`)
      dispatch(resetProduct())
    }
    // we use productError since products can be feteched by anyone
    tokenCheck(dispatch, userId, productError, userError, refreshToken)
  }, [dispatch, navigate, productStatus, user, token, productError, userError])

  const createProductHandler = () => {
    dispatch(createProduct({ token, userId }))
  }

  const deleteHandler = (productId) => {
    if (window.confirm('Are you sure?')) {
      dispatch(deleteProduct({ token, productId }))
    }
  }

  return (
    <>
      <Row className='align-items-center'>
        <Col>
          <h1>Products</h1>
        </Col>
        <Col className='text-end'>
          <Button
            className='my-3'
            onClick={createProductHandler}
          >
            <i className='fas fa-plus'></i> Create Product
          </Button>
        </Col>
      </Row>
      {productsError && <Message variant='danger'>{productsError}</Message>}
      {productsStatus === 'loading' ? (
        <Loader></Loader>
      ) : productsError ? (
        <Message variant='danger'>{productsError}</Message>
      ) : (
        <>
          <Table
            striped
            bordered
            hover
            responsive
            className='table-sm'
          >
            <thead>
              <tr>
                <th>Id</th>
                <th>Name</th>
                <th>Price</th>
                <th>Category</th>
                <th>Brand</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id_product}>
                  <td>{p.id_product}</td>
                  <td>{p.name}</td>
                  <td>${p.price}</td>
                  <td>{p.category}</td>
                  <td>{p.brand}</td>
                  <td>
                    <LinkContainer to={`/admin/products/${p.id_product}/edit`}>
                      <Button
                        variant='light'
                        className='btn-sm'
                      >
                        <i className='fas fa-edit'></i>
                      </Button>
                    </LinkContainer>
                    <Button
                      variant='danger'
                      className='btn-sm'
                      onClick={() => deleteHandler(p.id_product)}
                    >
                      <i className='fas fa-trash'></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Paginate
            pages={pages}
            page={page}
            adminPage={true}
          ></Paginate>
        </>
      )}
    </>
  )
}

export default ProductsScreen
