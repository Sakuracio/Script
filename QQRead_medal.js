/*QQ阅读书籍勋章打卡

创建日期:2020.11.27
当前版本:0.2
最后修改:2020.11.29

Author:小曦同桌*/

//运行环境 JSBox 运行后请等待通知
//需要签到的 书籍越多 等待的 时间 越长
//可能会因为 签到过快 导致 签到失败
//设置 QQ号码 和 阅文Key 抓包获取APP获取
//微信登录的未做测试
//勋章需要手动领取 懒orz
var qid = ''//QQ号码
var ywkey = ''//阅文Key

/*********************************************
以下内容请勿修改 以下内容请勿修改 以下内容请勿修改
以下内容请勿修改 以下内容请勿修改 以下内容请勿修改
以下内容请勿修改 以下内容请勿修改 以下内容请勿修改
**********************************************/
var ua = 'QQReaderUI/1997 CFNetwork/1126 Darwin/19.5.0'
var ver = 'qqreader_7.5.20.0344_iphone'
var uri = 'https://commontgw6.reader.qq.com/v7_5_2/'
var url = uri + 'medal/mainPage?user=' + qid

const data = await $http.request({
    method: "GET",
    url: url,
    header: {
        'User-Agent': ua,
        'version': ver,
        'ywguid': qid,
        'ywkey': ywkey
    }
})

var info = data.data
var user = info.userInfo
var book = info.medalData[2]
var unbook = info.medalData[2].notGotMedals
var mid = new Array()
var bid = new Array()
var sign = new Array()
var bidname = new Array()
var res = user.nickname + user.medalCountIntro + "勋章，其中" + book.gotMedals.length + "本书籍勋章，还有" + book.notGotMedals.length + "本书籍勋章尚未获得！" + "\n"

//关系开始
if (book.notGotMedals.length == 0) {
    res = res + "没有需要签到的书籍了✓"
    $push.schedule({
        title: "QQ阅读勋章签到结果",
        body: res,
        delay: 0,
    })
} else {
    //获取mid
    for (let i = 0; i < unbook.length; i++) {
        mid.push(unbook[i].medalId)
        //console.log(unbook[i].medalId)
    }

    //获取bid
    for (let i = 0; i < unbook.length; i++) {
        //构造URL
        let url = uri + 'medal/detail?medalId=' + mid[i] + '&userId=' + qid
        //查询bid
        const b_data = await $http.request({
            method: "GET",
            url: url,
            header: {
                'User-Agent': ua,
                'version': ver,
                'ywguid': qid,
                'ywkey': ywkey
            }
        })
        let id = b_data.data.bookQurl
        let name = b_data.data.medalInfo.name
        bid.push(id.slice(-8))
        bidname.push(name)
        //console.log(bid[i])
    }

    //开始签到
    res = res + "开始签到！！！" + "\n"
    for (let i = 0; i < unbook.length; i++) {
        //构造URL
        let url = uri + 'fandomTask/sign?bid=' + bid[i]
        //执行签到
        const task = await $http.request({
            method: "GET",
            url: url,
            header: {
                'User-Agent': ua,
                'version': ver,
                'ywguid': qid,
                'ywkey': ywkey
            }
        })
        //获得结果
        if (task.data.code == 0) {
            sign.push("勋章 《" + bidname[i] + "》 签到成功✓")
        } else {
            sign.push("勋章 《" + bidname[i] + "》 签到失败")
        }
        res = res + sign[i] + "\n"
    }

    res = res + "签到任务执行完成✓"
    $push.schedule({
        title: "QQ阅读勋章签到结果",
        body: res,
        delay: 0,
    })
}
