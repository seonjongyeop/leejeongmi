// script.js
document.addEventListener('DOMContentLoaded', () => {
    const artworkImage = document.getElementById('artwork-image');
    const artworkDetailNumber = document.getElementById('artwork-detail-number');
    const artworkDetailTitle = document.getElementById('artwork-detail-title');
    const artworkDetailArtist = document.getElementById('artwork-detail-artist');
    const artworkDetailInfo = document.getElementById('artwork-detail-info');
    const artworkDetailDescription = document.getElementById('artwork-detail-description');
    const paginationContainer = document.getElementById('pagination-container');
    const artistNameLink = document.getElementById('artist-name-link');
    const websiteLink = document.getElementById('website-link');
    const enlargeButton = document.getElementById('enlarge-button');
    const enlargeModal = document.getElementById('enlarge-modal');
    const enlargedImage = document.getElementById('enlarged-image');
    const closeModalButton = document.querySelector('.close-button');
    const imageLoadError = document.getElementById('image-load-error');

    const scrollableContainer = document.querySelector('.gallery-main-container');
    const modalContent = document.querySelector('.modal-content'); // 모달 콘텐츠 영역

    let artworks = [];
    let currentArtworkId = 1;

    function renderArtwork(artwork) {
        if (!artwork) {
            console.error('렌더링할 작품 데이터가 정의되지 않았습니다.');
            artworkImage.src = '';
            artworkImage.alt = '작품 로드 실패';
            artworkImage.style.display = 'none';
            imageLoadError.style.display = 'block';
            artworkDetailNumber.textContent = '';
            artworkDetailTitle.textContent = '작품 정보를 불러올 수 없습니다.';
            artworkDetailArtist.textContent = '';
            artworkDetailInfo.textContent = '';
            artworkDetailDescription.textContent = '데이터 로딩 중 오류가 발생했거나 작품을 찾을 수 없습니다.';
            enlargeButton.style.display = 'none';
            return;
        }

        artworkImage.style.display = 'block';
        imageLoadError.style.display = 'none';

        const artworkDisplay = document.querySelector('.artwork-display');
        artworkDisplay.style.opacity = 0;

        setTimeout(() => {
            artworkImage.src = artwork.thumbnail;
            artworkImage.alt = artwork.title;
            artworkDetailNumber.textContent = `${artwork.id}.`;
            artworkDetailTitle.textContent = `${artwork.artist}, ‹${artwork.title}›(${artwork.year})`;
            artworkDetailArtist.textContent = `${artwork.material}, ${artwork.size}`;
            artworkDetailInfo.textContent = '';
            artworkDetailDescription.textContent = artwork.description;
            enlargeButton.style.display = 'block';

            artworkDisplay.style.opacity = 1;
        }, 100);
    }

    artworkImage.onerror = () => {
        console.error(`이미지 로드 실패: ${artworkImage.src}`);
        artworkImage.style.display = 'none';
        imageLoadError.style.display = 'block';
        imageLoadError.textContent = `이미지 로드 실패: ${artworkImage.src.split('/').pop()} 파일을 확인해주세요.`;
    };

    artworkImage.onload = () => {
        artworkImage.style.display = 'block';
        imageLoadError.style.display = 'none';
    };

    function renderPagination() {
        paginationContainer.innerHTML = '';
        artworks.forEach(artwork => {
            const pageNumberDiv = document.createElement('div');
            pageNumberDiv.classList.add('page-number');
            pageNumberDiv.textContent = artwork.id;
            pageNumberDiv.setAttribute('role', 'button');
            pageNumberDiv.setAttribute('tabindex', '0');
            pageNumberDiv.setAttribute('aria-label', `${artwork.id}번 작품`);

            if (artwork.id === currentArtworkId) {
                pageNumberDiv.classList.add('active');
            }

            pageNumberDiv.addEventListener('click', () => {
                navigateToArtwork(artwork.id);
            });

            pageNumberDiv.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    navigateToArtwork(artwork.id);
                }
            });

            paginationContainer.appendChild(pageNumberDiv);
        });
    }

    function navigateToArtwork(id) {
        currentArtworkId = id;
        const artwork = artworks.find(a => a.id === id);
        if (artwork) {
            renderArtwork(artwork);
            renderPagination();
            const newPath = `/artwork/${id}`;
            const hashUrl = `#${newPath}`;

            if (window.location.hash !== hashUrl) {
                history.replaceState({ page: id }, '', hashUrl);
            }
            if (scrollableContainer) {
                scrollableContainer.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } else {
            console.error(`데이터에서 ID ${id}의 작품을 찾을 수 없습니다.`);
            renderArtwork(null);
            history.replaceState({ page: id }, '', `#/artwork/not-found`);
        }
    }

    fetch('data/artworks.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP 오류! 상태: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            artworks = data;
            const hashSegments = window.location.hash.split('/');
            const lastHashSegment = hashSegments[hashSegments.length - 1];

            let initialId = 1;

            if (hashSegments.includes('artwork') && !isNaN(parseInt(lastHashSegment))) {
                const parsedId = parseInt(lastHashSegment);
                if (parsedId >= 1 && parsedId <= artworks.length) {
                    initialId = parsedId;
                }
            }
            currentArtworkId = initialId;

            navigateToArtwork(currentArtworkId);

            window.addEventListener('popstate', (event) => {
                const popStateHashSegments = window.location.hash.split('/');
                const popStateLastSegment = popStateHashSegments[popStateHashSegments.length - 1];
                let popStateId = 1;

                if (popStateHashSegments.includes('artwork') && !isNaN(parseInt(popStateLastSegment))) {
                    const parsedId = parseInt(popStateLastSegment);
                    if (parsedId >= 1 && parsedId <= artworks.length) {
                        popStateId = parsedId;
                    }
                }
                currentArtworkId = popStateId;

                const artwork = artworks.find(a => a.id === currentArtworkId);
                if (artwork) {
                    renderArtwork(artwork);
                    renderPagination();
                } else {
                    renderArtwork(null);
                }
            });
        })
        .catch(error => {
            console.error('artworks.json에서 작품 데이터를 로드하는 중 오류 발생:', error);
            artworkDetailTitle.textContent = "전시관 데이터를 불러오는 데 실패했습니다.";
            artworkDetailDescription.textContent = "네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요. (오류: " + error.message + ")";
            artworkImage.style.display = 'none';
            enlargeButton.style.display = 'none';
            paginationContainer.style.display = 'none';
            imageLoadError.style.display = 'block';
            imageLoadError.textContent = "데이터 로딩 오류: " + error.message;
        });

    artistNameLink.addEventListener('click', (event) => {
        event.preventDefault();
        navigateToArtwork(1);
    });

    artistNameLink.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            navigateToArtwork(1);
        }
    });

    websiteLink.addEventListener('click', () => {});

    enlargeButton.addEventListener('click', () => {
        const currentArtwork = artworks.find(a => a.id === currentArtworkId);
        if (currentArtwork && currentArtwork.full) {
            enlargedImage.src = currentArtwork.full;
            enlargedImage.alt = `${currentArtwork.title} (확대 이미지)`;
            enlargeModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            resetZoomPan();
        } else {
            console.warn("Full-size image not available for this artwork or data not loaded.");
            alert("확대 이미지를 불러올 수 없습니다.");
        }
    });

    closeModalButton.addEventListener('click', () => {
        enlargeModal.style.display = 'none';
        document.body.style.overflow = '';
        resetZoomPan();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && enlargeModal.style.display === 'flex') {
            enlargeModal.style.display = 'none';
            document.body.style.overflow = '';
            resetZoomPan();
        }
    });

    enlargeModal.addEventListener('click', (event) => {
        if (event.target === enlargeModal) {
            enlargeModal.style.display = 'none';
            document.body.style.overflow = '';
            resetZoomPan();
        }
    });

    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let startX, startY; // 마우스 클릭 시작점 또는 터치 드래그 시작점 (translate 값을 기준으로 함)
    // 확대/축소 시 이미지 내에서 고정할 지점의 상대 좌표 (0~1)
    let zoomPointX = 0.5;
    let zoomPointY = 0.5;

    function applyTransform() {
        enlargedImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        enlargedImage.style.cursor = scale > 1 ? 'grab' : 'default';
    }

    function resetZoomPan() {
        scale = 1;
        translateX = 0;
        translateY = 0;
        applyTransform();
    }

    function limitPan() {
        const modalRect = modalContent.getBoundingClientRect(); // 모달 콘텐츠 영역 크기
        const imageNaturalWidth = enlargedImage.naturalWidth; // 이미지 원본 너비
        const imageNaturalHeight = enlargedImage.naturalHeight; // 이미지 원본 높이

        // 현재 스케일에 따른 이미지의 논리적 크기
        const scaledWidth = imageNaturalWidth * scale;
        const scaledHeight = imageNaturalHeight * scale;

        // 이미지의 현재 렌더링된 크기 (CSS max-width/max-height 적용 후)
        // enlargedImage.getBoundingClientRect()는 이 값을 반환
        const currentRenderedWidth = enlargedImage.getBoundingClientRect().width;
        const currentRenderedHeight = enlargedImage.getBoundingClientRect().height;

        // 이미지와 모달의 비율 차이를 고려하여 실제 이미지의 표시 영역 계산
        // object-fit: contain 에 의해 이미지의 실제 표시 크기는 modalContent에 맞춰 조정됨
        const modalRatio = modalRect.width / modalRect.height;
        const imageRatio = imageNaturalWidth / imageNaturalHeight;

        let actualImageDisplayWidth = currentRenderedWidth;
        let actualImageDisplayHeight = currentRenderedHeight;

        if (imageRatio > modalRatio) { // 이미지가 모달보다 가로로 김 (모달 높이에 맞춰짐)
             actualImageDisplayHeight = modalRect.width / imageRatio; // 모달 너비에 맞춘 높이
             actualImageDisplayWidth = modalRect.width;
        } else { // 이미지가 모달보다 세로로 김 (모달 너비에 맞춰짐)
             actualImageDisplayWidth = modalRect.height * imageRatio; // 모달 높이에 맞춘 너비
             actualImageDisplayHeight = modalRect.height;
        }

        // 실제 이미지 표시 크기가 모달보다 작으면 패닝 제한을 0으로 설정하여 중앙에 고정
        if (currentRenderedWidth <= modalRect.width && currentRenderedHeight <= modalRect.height) {
            translateX = 0;
            translateY = 0;
            return;
        }
        
        // 현재 스케일과 `object-fit: contain`에 의해 결정된 이미지의 "렌더링 기준 스케일"을 고려해야 함.
        // 예를 들어, 이미지가 너무 커서 모달에 'contain'될 때, scale=1 이더라도 실제 렌더링 스케일은 1보다 작을 수 있음.
        // 즉, getBoundingClientRect()로 얻은 이미지의 실제 너비/높이가 naturalWidth/naturalHeight * scale과 다를 수 있음.

        // 실제 렌더링된 이미지의 크기
        const imgRenderedWidth = enlargedImage.getBoundingClientRect().width;
        const imgRenderedHeight = enlargedImage.getBoundingClientRect().height;

        // 이미지가 실제로 렌더링되고 있는 크기를 기준으로 최대 이동 범위 계산
        // 이 계산은 이미지의 현재 스케일이 아닌, `object-fit: contain`에 의해 최종적으로 결정된 크기를 반영
        const maxPanX = Math.max(0, (imgRenderedWidth * scale - modalRect.width) / 2);
        const maxPanY = Math.max(0, (imgRenderedHeight * scale - modalRect.height) / 2);

        translateX = Math.max(-maxPanX, Math.min(translateX, maxPanX));
        translateY = Math.max(-maxPanY, Math.min(translateY, maxPanY));
    }


    enlargedImage.addEventListener('wheel', (event) => {
        event.preventDefault();
        const scaleAmount = 0.1;
        const oldScale = scale;

        let newScale;
        if (event.deltaY < 0) { // 휠 업: 확대
            newScale = scale + scaleAmount;
        } else { // 휠 다운: 축소
            newScale = scale - scaleAmount;
        }

        newScale = Math.max(0.5, Math.min(newScale, 5));

        if (newScale !== oldScale) {
            const rect = enlargedImage.getBoundingClientRect(); // 현재 렌더링된 이미지의 크기와 위치

            // 마우스 커서의 모달 콘텐츠 영역 내 상대 좌표
            const mouseXInModal = event.clientX - modalContent.getBoundingClientRect().left;
            const mouseYInModal = event.clientY - modalContent.getBoundingClientRect().top;

            // 현재 스케일에서의 이미지 중심 좌표 (모달 콘텐츠 내에서)
            const currentImageCenterX = (rect.left + rect.width / 2) - modalContent.getBoundingClientRect().left;
            const currentImageCenterY = (rect.top + rect.height / 2) - modalContent.getBoundingClientRect().top;

            // 마우스 커서 위치를 이미지의 transform-origin (중앙) 기준으로 변환
            const pointX = (mouseXInModal - currentImageCenterX) / oldScale;
            const pointY = (mouseYInModal - currentImageCenterY) / oldScale;

            // 새로운 translate 값 계산
            translateX = mouseXInModal - (pointX * newScale + currentImageCenterX);
            translateY = mouseYInModal - (pointY * newScale + currentImageCenterY);
            
            // 기존 translate 값에 현재 마우스 위치 보정을 더함 (가장 핵심적인 로직)
            // transformedX = currentImageCenterX + currentTranslateX * currentScale + deltaX
            // newTranslateX = currentTranslateX + ( (event.clientX - imageRect.left) / currentScale - (event.clientX - imageRect.left) / newScale )
            // 이 방법이 가장 정확하고 보편적임.
            
            // 기존 translateX, translateY는 이미지 중심에서 얼마나 떨어져 있는지 나타내는 값.
            // (transform-origin이 50% 50%이므로)
            // 그래서 마우스 위치에서 현재 translateX, translateY를 빼서, 마우스가 이미지의 원본 좌표계에서
            // 어느 지점에 해당하는지를 구하는게 더 직관적임.

            // 현재 이미지의 원본 사이즈를 기준으로 계산된 좌표 (실제 이미지 픽셀 단위)
            const originX = (event.clientX - rect.left - translateX); // translateX를 이미 적용한 상태의 마우스 위치
            const originY = (event.clientY - rect.top - translateY);

            const dx = (originX / oldScale) * (newScale - oldScale);
            const dy = (originY / oldScale) * (newScale - oldScale);

            translateX -= dx;
            translateY -= dy;


            scale = newScale;
            limitPan();
            applyTransform();
        }
    });

    enlargedImage.addEventListener('mousedown', (event) => {
        if (scale > 1) {
            isDragging = true;
            // 드래그 시작점을 현재 마우스 위치에서 이미 적용된 translate 값을 빼서 계산
            startX = event.clientX - translateX;
            startY = event.clientY - translateY;
            enlargedImage.style.cursor = 'grabbing';
            enlargedImage.style.transition = 'none';
        }
    });

    enlargedImage.addEventListener('mousemove', (event) => {
        if (!isDragging) return;
        event.preventDefault();
        // 새로운 translate 값을 계산
        translateX = event.clientX - startX;
        translateY = event.clientY - startY;
        
        limitPan();
        applyTransform();
    });

    enlargedImage.addEventListener('mouseup', () => {
        isDragging = false;
        enlargedImage.style.cursor = scale > 1 ? 'grab' : 'default';
        enlargedImage.style.transition = 'transform 0.1s ease-out';
    });

    enlargedImage.addEventListener('mouseleave', () => {
        isDragging = false;
        enlargedImage.style.cursor = scale > 1 ? 'grab' : 'default';
        enlargedImage.style.transition = 'transform 0.1s ease-out';
    });

    let touchStartX = 0, touchStartY = 0;
    let initialPinchDistance = 0;
    let initialZoomScale = 1;
    let lastTapTime = 0;
    // 핀치 줌 시작 시 이미지 내에서의 핀치 중심 상대 좌표 (0~1)
    let pinchZoomPointX = 0.5; 
    let pinchZoomPointY = 0.5;

    enlargedImage.addEventListener('touchstart', (event) => {
        if (event.touches.length === 1) {
            isDragging = true;
            touchStartX = event.touches[0].clientX - translateX;
            touchStartY = event.touches[0].clientY - translateY;

            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTapTime;
            if (tapLength < 300 && tapLength > 0) {
                event.preventDefault();
                resetZoomPan();
            }
            lastTapTime = currentTime;

        } else if (event.touches.length === 2) {
            isDragging = false;
            initialPinchDistance = getPinchDistance(event.touches);
            initialZoomScale = scale;

            const rect = enlargedImage.getBoundingClientRect();
            // 핀치 시작 시 두 손가락의 중심점 (모달 콘텐츠 내의 절대 좌표)
            const pinchCenterX_abs = (event.touches[0].clientX + event.touches[1].clientX) / 2;
            const pinchCenterY_abs = (event.touches[0].clientY + event.touches[1].clientY) / 2;
            
            // 이미지 엘리먼트 기준, 현재 translateX, translateY가 적용된 상태에서의 핀치 중심점.
            // 이를 통해 핀치 중심이 이미지의 어떤 '원본 픽셀'에 해당하는지 파악.
            const pointX_inImage = (pinchCenterX_abs - rect.left - translateX);
            const pointY_inImage = (pinchCenterY_abs - rect.top - translateY);

            // 이미지의 원본 픽셀 좌표를 현재 스케일로 나눈 값 (원본 스케일 1 기준의 좌표)
            pinchZoomPointX = pointX_inImage / oldScale;
            pinchZoomPointY = pointY_inImage / oldScale;
        }
        enlargedImage.style.transition = 'none';
    }, { passive: false });

    enlargedImage.addEventListener('touchmove', (event) => {
        event.preventDefault();

        if (isDragging && event.touches.length === 1) {
            translateX = event.touches[0].clientX - touchStartX;
            translateY = event.touches[0].clientY - touchStartY;
            limitPan();
            applyTransform();
        } else if (event.touches.length === 2 && initialPinchDistance > 0) {
            const currentPinchDistance = getPinchDistance(event.touches);
            let newScale = initialZoomScale * (currentPinchDistance / initialPinchDistance);
            newScale = Math.max(0.5, Math.min(newScale, 5));

            if (newScale !== scale) {
                const rect = enlargedImage.getBoundingClientRect();

                // 새로운 스케일에 따라 이미지의 핀치 중심점이 이동해야 하는 거리 계산
                // 이미지의 원본 좌표계에서의 핀치 중심점(pinchZoomPointX/Y)을 새로운 스케일로 곱하고,
                // 이를 기존 스케일에서의 위치와 비교하여 translate를 보정.
                const dx = (pinchZoomPointX * newScale) - (pinchZoomPointX * scale);
                const dy = (pinchZoomPointY * newScale) - (pinchZoomPointY * scale);

                translateX -= dx;
                translateY -= dy;

                scale = newScale;
                limitPan();
                applyTransform();
            }
        }
    }, { passive: false });

    enlargedImage.addEventListener('touchend', () => {
        isDragging = false;
        initialPinchDistance = 0;
        initialZoomScale = scale;
        enlargedImage.style.transition = 'transform 0.1s ease-out';
    });

    function getPinchDistance(touches) {
        return Math.hypot(
            touches[1].pageX - touches[0].pageX,
            touches[1].pageY - touches[0].pageY
        );
    }
});
