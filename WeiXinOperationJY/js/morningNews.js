//Vue.prototype.$ajax= axios
var app = new Vue({
	el: '#app',
	data: {
		today: '',
		nameTitle: '',
		review: '',
		compareArr: [],
		zhang: "zhang",
		die: "die",
		curBalance: '',
		suggestPzArr: [],
		liWidth: '',
		tip: '',
		proposal: '',
		viewArr: [],
		proposalRatio: '',
		suggestTable: [],
		weekKeywords: '',
		monthRank: "",
		rankChange: '',
		startBalance: '',
		withdraw: '',
		deposit: '',
		profit: '',
		profitRatio: '',
		tradeCount: '',
		winRatio: '',
		maxProfit: '',
		maxLoss: '',
		profitWith: '',
		winWith: '',
		viewday: '',
		pzArr: [],
		navArr: [],
		activeItem: '',
		pzDescription: '',
		pzProposal: '',
		news: []
	},
	created() {
//		//获取ClientCode
		axios.post('http://wx.zzfco.com/wxweb/api/tempMsg/getClientCode.do', {}, {
				headers: {
					"Content-Type": "application/json"
				}
			})
			.then((res) => {
				var resData = res.data.data
				//获取发送时间
				axios.post(`http://wx.zzfco.com/wxweb/api/tempMsg/getSendDate/${$.getUrlParam("t")}.do`, {}, {
						headers: {
							"Content-Type": "application/json"
						}
					})
					.then((res) => {
						this.getData(resData, new Date(res.data.data).Format("yyyy-MM-dd"))
						this.today = new Date(res.data.data).Format("yyyy-MM-dd").split("-").join("/")
						this.viewday = this.today.split("-").join("/")
//						this.getData(1100583, "2018-01-29")
					})
					.catch((res) => {
						console.log(err);
					});

			})
			.catch((res) => {
				console.log(err);
			});
		//记录打开
		axios.post(`http://wx.zzfco.com/wxweb/api/tempMsg/recordOpenedTemplateMsg/${$.getUrlParam("t")}.do`, {}, {
				headers: {
					"Content-Type": "application/json"
				}
			})
			.then((res) => {
				console.log(res);
			})
			.catch((res) => {
				console.log(err);
			});
	},
	methods: {
		selectOn: function(item, index) {
			this.activeItem = item
			this.pzDescription = this.pzArr[index].description
			this.pzProposal = this.pzArr[index].proposal
		},
		getData: function(clientCode, cxdate) { //获取数据
			var axiosUrl = `http://116.228.27.139:9091/api/win/getClientProposal?client_code=${clientCode}&date=${cxdate}`
			axios.get(axiosUrl)
				.then((res) => {
					let resData = res.data.data
					console.log(resData)
					let firstName = resData.name.substring(0, 1)
					if(res.data.data.sex == '男') {
						this.nameTitle = `尊敬的${firstName}先生,早上好 !`
					} else {
						this.nameTitle = `尊敬的${firstName}女士,早上好 !`
					}
					this.review = resData.proposal.review
					for(let i = 0; i < resData.basis.length; i++) {
						var temp2 = {
							"name": this.dictionary(resData.basis[i].contractObject),
							"p1": resData.basis[i].closePrice,
							"r1": (parseFloat(resData.basis[i].CHGPct * 100)).toFixed(2),
							"p2": resData.basis[i].price,
							"r2": (parseFloat(resData.basis[i].spotCHGPct * 100)).toFixed(2),
							"jc": resData.basis[i].basis,
							"change": resData.basis[i].basisChg
						}
						this.compareArr.push(temp2)
					}

					var temp1 = resData.proposalPosition.proposalObject
					for(let i = 0; i < temp1.length; i++) {
						var newObj = {
							name: this.dictionary(temp1[i].object),
							instrumentCode: temp1[i].instrument_code,
							volume: temp1[i].volume
						}
						this.suggestPzArr.push(newObj)
					}
					this.liWidth = 100 / (this.suggestPzArr.length) + "%"
					for(let i = 0; i < this.suggestPzArr.length; i++) {
						if(i % 2 == 0) {
							this.suggestPzArr[i].floatClass = "bubbleAnimate1"
							this.suggestPzArr[i].cbgClass = "cbg1"
						} else {
							this.suggestPzArr[i].floatClass = "bubbleAnimate2"
							this.suggestPzArr[i].cbgClass = "cbg2"
						}
					}
					console.log(this.suggestPzArr)
					this.proposal = resData.proposal.proposal
					this.curBalance = `&yen;${resData.proposalPosition.balance}`
					this.proposalRatio = resData.proposalPosition.proposalRatio * 100 + "%"
					this.tip = this.proposalRatio
					var objectPosition = resData.proposalPosition.objectPosition
					for(let i = 0; i < objectPosition.length; i++) {
						if(objectPosition[i].adjustVolume >= 0) {
							var tempAdjustVolume = `+${objectPosition[i].adjustVolume}`
						} else {
							var tempAdjustVolume = objectPosition[i].adjustVolume
						}
						var newObj = {
							name: objectPosition[i].name, //品种
							longVolume: objectPosition[i].longVolume, //总可开手数	
							netLongVolume: objectPosition[i].netLongVolume, //净仓
							bili: (parseFloat(objectPosition[i].margin) / parseFloat(resData.proposalPosition.balance) * 100).toFixed(2) + "%", //比例
							dc: this.proposalRatio, //底仓
							adjustVolume: tempAdjustVolume, //调整
							direction: objectPosition[i].direction, //方向
						}
						var newPositionArr = []
						if(objectPosition[i].proposalPrice == null) {
							var tempProposalPrice = "暂无"
						} else {
							var tempProposalPrice = objectPosition[i].proposalPrice + "元"
						}

						for(let j = 0; j < objectPosition[i].position.length; j++) {
							if(objectPosition[i].position[j].direction == 1) {
								var newvolume = objectPosition[i].position[j].volume
							} else {
								var newvolume = "-" + objectPosition[i].position[j].volume
							}
							var newPosition = {
								instrumenCode: objectPosition[i].position[j].instrument_code,
								volume: newvolume,
								price: objectPosition[i].position[j].price,
								proposalPrice: tempProposalPrice
							}
							newPositionArr.push(newPosition)
						}
						newObj.position = newPositionArr
						this.viewArr.push(newObj)
					}
					this.weekKeywords = resData.proposal.keyword

					this.getRank(clientCode, resData.profit.endDate)
					this.startBalance = `&yen;${resData.profit.startBalance}`
					this.withdraw = `&yen;${resData.profit.withdraw}`
					this.deposit = `&yen;${resData.profit.deposit}`
					this.profit = `&yen;${resData.profit.profit}`
					this.profitRatio = (parseFloat(resData.profit.profitRatio) * 100).toFixed(2) + "%"
					this.profitWith = this.profitRatio
					this.tradeCount = resData.profit.tradeCount
					this.winRatio = (parseFloat(resData.profit.winRatio) * 100).toFixed(2) + "%"
					this.winWith = this.winRatio
					this.maxProfit = `&yen;${resData.profit.maxProfit}`
					this.maxLoss = `&yen;${resData.profit.maxLoss}`
					this.pzArr = resData.proposal.objectProposal
					for(let i = 0; i < this.pzArr.length; i++) {
						this.navArr.push(this.dictionary(this.pzArr[i].object))
					}
					this.activeItem = this.navArr[0]
					this.pzDescription = this.pzArr[0].description
					this.pzProposal = this.pzArr[0].proposal
					var len = sessionStorage.getItem("scrollTop")
					if(len != null || len != undefined) {
						$('.wrapper').animate({
							scrollTop: len
						}, 1000);
					}
					this.news = resData.proposal.news
				})
				.catch((error) => {
					console.log(error);
				});
		},
		getRank: function(clientCode, today) { //获取排名
			axios.post('http://wx.zzfco.com/wxweb/api/total/rankByType.do', {
					clientCode: clientCode,
					endDate: today,
					type: 1
				}, {
					headers: {
						"Content-Type": "application/json"
					}
				})
				.then((res) => {
					let resData = res.data.data
					this.monthRank = `NO.${resData.rank}`
					if(resData.rankChange >= 0) {
						this.rankChange = `+${resData.rankChange}`
					} else {
						this.rankChange = `${resData.rankChange}`
					}
				})
				.catch((res) => {
					console.log(err);
				});
		},
		setScrollTop: function() {
			sessionStorage.setItem("scrollTop", $(".bg1").height() + $(".bg2").height() + $(".bg3").height() - $(".news").height())
		},
		dictionary: function(n) {
			var pz = ""
			switch(n) {
				case 'RB':
					pz = '螺纹钢 '
					break;
				case 'I':
					pz = '铁矿石'
					break;
				case 'HC':
					pz = '热卷'
					break;
				case 'J':
					pz = '焦碳';
					break;
				case 'JM':
					pz = '焦煤'
					break;
				case 'RU':
					pz = '橡胶'
					break;
				case 'L':
					pz = '塑料'
					break;
				case 'PP':
					pz = '聚丙烯'
					break;
			}
			return pz;
		}
	}
})