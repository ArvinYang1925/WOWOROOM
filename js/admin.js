// API Setting
const api_path = "arvin";
const token = "av7hkORHfkhzaZuaz785ZHyKDct2";

const orderList = document.querySelector('.orderList')
let orderListData = []

// 程式執行
function init() {
    getOrderList()
}
  
init()

function renderC3() {
  // 全產品類別營收總和物件
  let itemObj = {}
  // 走訪所有訂單品項
  orderListData.forEach(function(item){
    orderProducts = item.products
    // 加總各種品項營收
    orderProducts.forEach(function(productItem){
      if(itemObj[productItem.category] == undefined) {
        itemObj[productItem.category] = productItem.price*productItem.quantity
      }else {
        itemObj[productItem.category] += productItem.price*productItem.quantity
      }
    })
  })
  // 品項種類陣列
  let itemsCategoryAry = []
  itemsCategoryAry = Object.keys(itemObj)
  // C3 js 所需陣列格式
  let allItemsPriceTotalAry = []
  itemsCategoryAry.forEach(function(category){
    let ary = []
    ary.push(category)
    ary.push(itemObj[category])
    allItemsPriceTotalAry.push(ary)
  })
  // C3.js
  let chart = c3.generate({
    bindto: '#chart',
    data: {
        type: "pie",
        columns: allItemsPriceTotalAry,
        colors:{
            "床架":"#DACBFF",
            "收納":"#9D7FEA",
            "窗簾": "#5434A7",
        }
    },
  });
}

// 取得訂單列表
function getOrderList() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
      {
        headers: {
          Authorization: token,
        },
      }
    )
    .then(function (response) {
        orderListData = response.data.orders
        renderOrderList()
        renderC3()
    });
}

function renderOrderList() {
    let str = ''
    orderListData.forEach(function(item) {
        // unix 時間戳記轉換
        let orderDate = moment(item.createdAt*1000).format('YYYY-MM-DD')
        // 訂單狀態
        let orderStatus = item.paid
        let orderStatusLink = `<a href="#" class="changeOrderStatus" data-id="${item.id}" data-status="${item.paid}">未處理</a>`
        if(orderStatus) { 
          orderStatusLink = `<a href="#" class="changeOrderStatus" data-id="${item.id}" data-status="${item.paid}">已處理</a>`
        }
        // 訂單品項
        let orderProducts = item.products
        let orderItemStr = ''
        orderProducts.forEach(function(productItem) {
          orderItemStr +=`<p>${productItem.title}X${productItem.quantity} (${productItem.category})</p>`
        })
        // 訂單
        str+=`
        <tr>
            <td>${item.id}</td>
            <td>
                <p>${item.user.name}</p>
                <p>${item.user.tel}</p>
            </td>
            <td>${item.user.address}</td>
            <td>${item.user.email}</td>
            <td>
                ${orderItemStr}
            </td>
            <td>${orderDate}</td>
            <td class="orderStatus">
                ${orderStatusLink}
            </td>
            <td>
                <input type="button" class="delSingleOrder-Btn" data-id="${item.id}" value="刪除">
            </td>
        </tr>`
        orderList.innerHTML = str
    })
}

orderList.addEventListener("click",function(e){
  e.preventDefault()
  let orderId = ''
  // 修改訂單狀態
  if(e.target.getAttribute('class') == 'changeOrderStatus') {
    orderId = e.target.getAttribute('data-id')
    // 為字串
    let orderStatus = e.target.getAttribute('data-status')
    editOrderList(orderId,orderStatus)
  }
  // 刪除特定訂單
  if(e.target.getAttribute('class') == 'delSingleOrder-Btn') {
    orderId = e.target.getAttribute('data-id')
    deleteOrderItem(orderId)
  }
})

// 修改訂單狀態
function editOrderList(orderId,orderStatus) {
  // 修該訂單狀態
  if(orderStatus == 'true') {
    orderStatus = false
  } else if (orderStatus == 'false') {
    orderStatus = true
  }
  axios
    .put(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
      {
        data: {
          id: orderId,
          paid: orderStatus
        },
      },
      {
        headers: {
          Authorization: token,
        },
      }
    )
    .then(function (response) {
      alert('修該訂單狀態成功')
      orderListData = response.data.orders
      renderOrderList()
    }).catch(function(error){
      console.log(error.response.data)
    });
}

// 刪除特定訂單
function deleteOrderItem(orderId) {
  axios
  .delete(
    `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${orderId}`,
    {
      headers: {
        Authorization: token,
      },
    }
    )
    .then(function (response) {
      alert('刪除訂單成功')
      orderListData = response.data.orders
      renderOrderList()
      renderC3()
    });
}

// 清除全部訂單
let deleteAllOrderList = document.querySelector('.discardAllBtn')
deleteAllOrderList.addEventListener("click",function(e){
  console.log(e.target)
  deleteAllOrder()
})
// 刪除全部訂單
function deleteAllOrder() {
    axios
      .delete(
        `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
        {
          headers: {
            Authorization: token,
          },
        }
      )
      .then(function (response) {
        alert('已清除全部訂單')
        console.log(response.data);
        window.location.reload()
      });
}
