let colors = ['#f71735', '#067bc2', '#FFC247', '#3BD89F', '#81cfe5', '#f654a9'];
let shapes = [];
let objs = [];
let ctx;
let sideMenu;

function setup() {
	// createCanvas(800, 600); //設定畫布大小
  //產生一個全螢幕的畫布
  createCanvas(windowWidth*0.9, windowHeight*0.95);
	rectMode(CENTER);
	ctx = drawingContext;
	initialize();
}

function draw() {
	background('#121220');

	// 檢查滑鼠位置並控制選單
	if (sideMenu) {
		if (winMouseX < 300) { // 當滑鼠在選單區域內 (寬度 300px)
			sideMenu.addClass('menu-visible'); // 顯示選單
			
		} else { // 否則就隱藏選單
			sideMenu.removeClass('menu-visible');
		}
	}

	for (let o of objs) {
		o.run();
	}

	// 在畫布中央顯示 winMouseX 的值 (除錯後可移除)
	// fill(255); // 設定文字顏色為白色
	// noStroke();
	// textSize(32);
	// textAlign(CENTER, CENTER);
	// text('winMouseX: ' + winMouseX, width / 2, height / 2);

	if (frameCount % 400 == 0) {
		initialize();
	}
}

function checkRectCollision(a, b) {
	return (
		a.x - a.w / 2 < b.x + b.w / 2 &&
		a.x + a.w / 2 > b.x - b.w / 2 &&
		a.y - a.h / 2 < b.y + b.h / 2 &&
		a.y + a.h / 2 > b.y - b.h / 2
	);
}

function checkCircleCollision(a, b) {
	let distSq = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
	let radiusSum = (a.w / 2) + (b.w / 2);
	return distSq < radiusSum ** 2;
}

function checkCircleRectCollision(circle, rect) {
	let nearestX = constrain(circle.x, rect.x - rect.w / 2, rect.x + rect.w / 2);
	let nearestY = constrain(circle.y, rect.y - rect.h / 2, rect.y + rect.h / 2);
	let distSq = (circle.x - nearestX) ** 2 + (circle.y - nearestY) ** 2;
	return distSq < (circle.w / 2) ** 2;
}

function checkCollision(a, b) {
	if (a.t == 0 && b.t == 0) return checkRectCollision(a, b);
	if (a.t == 1 && b.t == 1) return checkCircleCollision(a, b);
	return a.t == 0
		? checkCircleRectCollision(b, a)
		: checkCircleRectCollision(a, b);
}

function easeInOutCubic(x) {
	return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function initialize() {
	shapes = [];
	objs = [];
	let n = 15;

	// 創建選單 (如果尚未創建)
	if (!sideMenu) {
		sideMenu = createDiv('<a id="show-iframe-btn" href="#">第一單元作品</a><a id="show-iframe-btn-2" href="#">第一單元講義</a><a href="#">測驗系統</a><a href="#">回到首頁</a>');
		sideMenu.id('side-menu');

		// 綁定點擊事件來顯示 iframe
		select('#show-iframe-btn').mousePressed(function() {
			const iframeContainer = select('#iframe-container');
			const iframe = select('#content-iframe');
			iframe.attribute('src', 'https://cfchengit.github.io/20251020/');
			iframeContainer.style('display', 'flex');
		});

		select('#show-iframe-btn-2').mousePressed(function() {
			const iframeContainer = select('#iframe-container');
			const iframe = select('#content-iframe');
			iframe.attribute('src', 'https://hackmd.io/@cfchen/SJDlPQAsxx');
			iframeContainer.style('display', 'flex');
		});

		// 綁定點擊事件來隱藏 iframe
		select('#close-iframe-btn').mousePressed(function() {
			const iframeContainer = select('#iframe-container');
			iframeContainer.style('display', 'none');
		});
	}

	for (let i = 0; i < 10000; i++) {
		let x = (width / n) * int(random((n + 1)));
		let y = (height / n) * int(random((n + 1)));
		let w = (width / (n + 2)) * int(random(3) + 1);
		let h = (width / (n + 2)) * int(random(3) + 1);
		let clr = random(colors)
		if (random() < .5) {
			let tmp = w;
			w = h;
			h = tmp
		}
		let type = int(random(2));
		let newShape = { x, y, w: w, h: h, t: type, clr: clr };
		let overlap = false;
		for (let s of shapes) {
			if (checkCollision(newShape, s)) {
				overlap = true;
				break;
			}
		}
		if (!overlap) shapes.push(newShape);
	}

	for (let s of shapes) {
		objs.push(new OneStroke(s.x, s.y, s.w - width * 0.01, s.h - width * 0.01, s.t, s.clr));
	}
}

class OneStroke {
	constructor(x, y, w, h, type, clr) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.t = -int(random(150));
		this.t1 = 40;
		this.t2 = this.t1 + 150;
		this.t3 = this.t2 + 40;
		this.type = type;
		this.clr = clr;
		this.circumference = PI * this.w;
		if (this.type == 0) {
			this.circumference = (this.w + this.h) * 2;
		}
		this.amount = 0;
		this.vr = random([-1, 1]);
		this.hr = random([-1, 1]);
	}

	show() {
		push();
		translate(this.x, this.y);
		scale(this.vr, this.hr);
		ctx.setLineDash([this.circumference, this.circumference]);
		ctx.lineDashOffset = this.circumference + (this.circumference * this.amount);
		noFill();
		stroke(this.clr);
		strokeWeight(width * 0.01);
		if (this.type == 0) {
			rect(0, 0, this.w, this.h, width * 0.005);
		} else if (this.type == 1) {
			circle(0, 0, this.w);
		}
		pop();

	}

	move() {
		this.t++;
		if (0 < this.t && this.t < this.t1) {
			let n = norm(this.t, 0, this.t1 - 1);
			this.amount = easeInOutCubic(n);
		} else if (this.t2 < this.t && this.t < this.t3) {
			let n = norm(this.t, this.t2, this.t3 - 1);
			this.amount = easeInOutCubic(1 - n);
		}
	}

	run() {
		this.show();
		this.move();
	}
}
