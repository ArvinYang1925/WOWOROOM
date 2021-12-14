// API Setting
const api_path = "arvin";
const token = "av7hkORHfkhzaZuaz785ZHyKDct2";

const productList = document.querySelector('.productWrap')
const discardAllBtn = document.querySelector('.discardAllBtn') 
const shoppingCartList = document.querySelector('.shoopingCartContent')
// 產品列表
let products = []
// 購物車列表
let carts = []

// 程式執行
function init() {
  getProductList()
  getCartList()
}

init()

/* App Event */

// 加入購物車
productList.addEventListener("click",function(e) {
  e.preventDefault()
  // 去除點擊 productCard 按鈕以外的地方
  if(e.target.getAttribute("class") != "addCardBtn") {
    return;
  }
  // 加入購物車所需之 產品id
  let productId = e.target.getAttribute("data-id")
  // 加入購物車所需之 產品數量 (如果購物車內沒有該產品則數量為一，若有則數量加一)
  let itemQuantity = 1
  carts.forEach(function(item) {
    if(item.product.id == productId) {
      itemQuantity = item.quantity + 1
    }
  })
  // API POST Request
  addCartItem(productId,itemQuantity)
})

// 刪除購物車全部內容
deleteAllCartListBtn = document.querySelector('.discardAllBtn')
deleteAllCartListBtn.addEventListener("click",function(e) {
  e.preventDefault()
  deleteAllCartList()
})

// 刪除購物車內特定產品
shoppingCartList.addEventListener("click",function(e){
  e.preventDefault()
  // 點擊刪除 icon 之外的內容
  if(e.target.getAttribute("class") != "material-icons") {
    return
  }
  let cartItemId = e.target.getAttribute("data-id")
  let cartItemTitle = e.target.getAttribute("data-qq")
  deleteCartItem(cartItemId,cartItemTitle)
})

/* App API & Render */

// 取得產品列表
function getProductList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`).
    then(function (response) {
      products = response.data.products
      renderProductList()
    })
    .catch(function(error){
      console.log(error.response.data)
    })
}

// 下拉篩選
const productSelect = document.querySelector('.productSelect')
productSelect.addEventListener("change",function(e) {
  let category = e.target.value
  if(category == '全部') {
    renderProductList()
  } else {
    categoryFilter(e.target.value)
  }
})
// 下拉選單過濾篩選
function categoryFilter(category) {
  let str = ''
  products.forEach(function(item) {
    if(item.category == category) {
      str += `
        <li class="productCard">
          <h4 class="productType">新品</h4>
          <img src="${item.images}"
              alt="">
          <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
          <h3>${item.title}</h3>
          <del class="originPrice">${item.origin_price}</del>
          <p class="nowPrice">${item.price}</p>
        </li>
      `
    }
  })
  productList.innerHTML = str
}
// 產品列表渲染
function renderProductList() {
  let str = ''
  products.forEach(function(item) {
    str += `
      <li class="productCard">
        <h4 class="productType">新品</h4>
        <img src="${item.images}"
            alt="">
        <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
        <h3>${item.title}</h3>
        <del class="originPrice">${item.origin_price}</del>
        <p class="nowPrice">${item.price}</p>
      </li>
    `
  })
  productList.innerHTML = str
}

// 取得購物車列表
function getCartList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`).
    then(function (response) {
      carts = response.data.carts
      const totalPrice = document.querySelector('.totalPrice')
      totalPrice.textContent = response.data.finalTotal
      renderCartList()
    })
}

// 購物車列表渲染
function renderCartList() {
  let str = ''
  // cart list content
  carts.forEach(function(item) {
    let product = item.product 
    str += `
    <tr>
      <td>
          <div class="cardItem-title">
              <img src="${product.images}" alt="">
              <p>${product.title}</p>
          </div>
      </td>
      <td>${product.price}</td>
      <td>${item.quantity}</td>
      <td>${item.quantity*product.price}</td>
      <td class="discardBtn">
          <a href="#" class="material-icons" data-id="${item.id}" data-qq="${product.title}">
              clear
          </a>
      </td>
    </tr>
    `
  })
  shoppingCartList.innerHTML = str
}

// 清除購物車內全部產品
function deleteAllCartList() {
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`).
    then(function (response) {
      alert('刪除購物車全部內容')
      console.log(response.data);
      carts = response.data.carts
      renderCartList()
    })
}

// 加入購物車
function addCartItem(id,quantity) {
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`, {
    data: {
      "productId": id,
      "quantity": quantity
    }
  }).then(function (response) {
      alert('已加入購物車！')
      console.log(response.data);
      carts = response.data.carts
      renderCartList()
  })
}

// 刪除購物車內特定產品
function deleteCartItem(cartId,cartItemTitle) {
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`).
    then(function (response) {
      alert(`已刪除 ${cartItemTitle}`)
      console.log(response.data)
      carts = response.data.carts
      renderCartList()
    })
}

// 送出訂單
const orderForm = document.querySelector('.orderInfo-form')
const orderSubmitBtn = document.querySelector('.orderInfo-btn')

let customerName = document.getElementById('customerName')
let customerPhone = document.getElementById('customerPhone')
let customerEmail = document.getElementById('customerEmail')
let customerAddress = document.getElementById('customerAddress')
let tradeWay = document.getElementById('tradeWay')

function formValidation() {
  // 輸入驗證
  if( !customerName.value ||
      !customerPhone.value ||
      !customerEmail.value ||
      !customerAddress.value ||
      !tradeWay.value ) {
      alert('請確認全部資料已填入')
      return false
  }
  return true
}

orderSubmitBtn.addEventListener("click",function(e){
  e.preventDefault()
  // 表單驗證
  if(!formValidation()) {
    return
  }
  // 送出訂單 API
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,
    {
      "data": {
        "user": {
          "name": customerName.value,
          "tel": customerPhone.value,
          "email": customerEmail.value,
          "address": customerAddress.value,
          "payment": tradeWay.value
        }
      }
    }
  ).then(function (response) {
      console.log(response.data);
      alert('已成功送出訂單')
      window.location.reload()
      // 重新設定表單
      // orderForm.reset()
  }).catch(function(error){
      console.log(error.response.data);
      if(!error.response.data.status) {
        alert('當前購物車內沒有產品，所以無法送出訂單')
      }
  })
})
