document.addEventListener('DOMContentLoaded', async () => {

    // -------------------------------------------------------------------
    // 0. API 데이터 가져오기 (CORS 우회 로컬 서버 경유)
    // -------------------------------------------------------------------
    let dashboardData = null;
    try {
        const response = await fetch('http://localhost:5000/api/sejong_data');
        const jsonResult = await response.json();
        if (jsonResult.status === 'success') {
            dashboardData = jsonResult.data;
        } else {
            console.error('API Error:', jsonResult.message);
        }
    } catch (error) {
        console.error('서버 데이터를 가져오는 중 오류가 발생했습니다:', error);
    }

    // 데이터 패치 실패 시 기본값 (이전 하드코딩 값) 사용
    const dataJeonse = dashboardData ? dashboardData.indices.jeonse : [100.5, 101.2, 102.1, 103.0, 103.8, 104.5, 105.2, 106.0, 106.55];
    const dataTrading = dashboardData ? dashboardData.indices.trading : [100.2, 100.5, 100.8, 101.4, 101.6, 102.0, 102.3, 102.7, 102.94];
    const dataRent = dashboardData ? dashboardData.indices.rent : [100.0, 100.3, 100.7, 101.1, 101.5, 102.0, 102.5, 102.8, 103.39];
    const labels = dashboardData ? dashboardData.indices.months : ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월'];
    const jeonseRatioValue = dashboardData ? dashboardData.jeonse_ratio : 49.9;

    // 상단 요약 카드 수치 업데이트 (DOM 조작)
    if (dashboardData) {
        document.querySelectorAll('.main-value')[0].textContent = dashboardData.snapshots.trading_current;
        document.querySelectorAll('.main-value')[1].textContent = dashboardData.snapshots.jeonse_current;
        document.querySelectorAll('.main-value')[2].textContent = dashboardData.snapshots.rent_current;

        // 하단 인포그래픽 업데이트
        document.querySelector('.left-stat .value').textContent = dashboardData.land.price_increase_rate;
        document.querySelector('.right-stat .value').textContent = dashboardData.land.sentiment_index;
        document.querySelector('.footer-stat strong').textContent = dashboardData.land.transaction_volume + '건';
    }

    // -------------------------------------------------------------------
    // 1. 메인 차트: 매매/전세/월세 9개월 다중 선형 차트
    // -------------------------------------------------------------------
    const ctxMain = document.getElementById('mainTrendsChart').getContext('2d');

    // 차트 색상 정의 (Cobalt Blue, Light Blue, Grey)
    const colorJeonse = '#0047AB';
    const colorTrading = '#4A90E2';
    const colorRent = '#ADB5BD';

    new Chart(ctxMain, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '전세',
                    data: dataJeonse,
                    borderColor: colorJeonse,
                    backgroundColor: 'rgba(0, 71, 171, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: false,
                    pointBackgroundColor: colorJeonse,
                    pointHoverRadius: 6,
                },
                {
                    label: '매매',
                    data: dataTrading,
                    borderColor: colorTrading,
                    borderWidth: 2,
                    tension: 0.4,
                    fill: false,
                    pointHoverRadius: 5,
                },
                {
                    label: '월세',
                    data: dataRent,
                    borderColor: colorRent,
                    borderWidth: 2,
                    tension: 0.4,
                    fill: false,
                    pointBorderColor: 'transparent',
                    pointHoverRadius: 5,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        font: {
                            family: "'Inter', sans-serif"
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 29, 32, 0.9)',
                    titleFont: { family: "'Inter', sans-serif" },
                    bodyFont: { family: "'Inter', sans-serif" },
                    padding: 10,
                    cornerRadius: 8
                }
            },
            scales: {
                x: {
                    grid: { display: false }
                },
                y: {
                    min: 99,
                    grid: {
                        color: 'rgba(233, 236, 239, 0.5)',
                        drawBorder: false,
                    }
                }
            }
        }
    });

    // -------------------------------------------------------------------
    // 2. 우측 사이드바: 전세가율 반원(Semi-Donut) 차트
    // -------------------------------------------------------------------
    const ctxRatio = document.getElementById('ratioDonutChart').getContext('2d');

    const jeonseRemainder = 100 - jeonseRatioValue;

    new Chart(ctxRatio, {
        type: 'doughnut',
        data: {
            labels: ['전세가율', '나머지'],
            datasets: [{
                data: [jeonseRatioValue, jeonseRemainder],
                backgroundColor: [colorJeonse, '#E9ECEF'],
                borderWidth: 0,
                circumference: 180,
                rotation: 270,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '80%',
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            }
        },
        plugins: [{
            id: 'comparisonLine',
            afterDatasetDraw(chart, args, options) {
                const { ctx, width, height } = chart;
                ctx.save();

                const xCenter = width / 2;
                const yCenter = height / 2 + (chart.chartArea.height / 2) - 10;

                const outerRadius = chart.getDatasetMeta(0).data[0].outerRadius;
                const innerRadius = chart.getDatasetMeta(0).data[0].innerRadius;

                const angle = Math.PI + (Math.PI * (68.3 / 100));

                const xIn = xCenter + innerRadius * Math.cos(angle);
                const yIn = yCenter + innerRadius * Math.sin(angle);
                const xOut = xCenter + outerRadius * Math.cos(angle);
                const yOut = yCenter + outerRadius * Math.sin(angle);

                ctx.beginPath();
                ctx.moveTo(xIn, yIn);
                ctx.lineTo(xOut, yOut);
                ctx.strokeStyle = '#ADB5BD';
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.restore();
            }
        }]
    });

    // -------------------------------------------------------------------
    // 3. 온도계 애니메이션 트리거
    // -------------------------------------------------------------------
    setTimeout(() => {
        const fluid = document.querySelector('.thermometer-fluid');
        if (fluid) {
            fluid.style.height = '35%';
        }
    }, 500);
});
