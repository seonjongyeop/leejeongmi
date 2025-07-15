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
            // 작품 정보를 원하는 형식으로 조합하여 할당
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
            // [수정] URL 변경 로직: GitHub Pages 호환을 위해 해시 기반 URL 사용
            const newPath = `/artwork/${id}`; // 해시 뒤에 붙일 경로 (예: #/artwork/7)
            const hashUrl = `#${newPath}`;

            // 현재 URL의 해시가 이미 원하는 경로와 같다면 변경하지 않음
            if (window.location.hash !== hashUrl) {
                // replaceState를 사용하여 브라우저 히스토리 스택에 새 항목을 추가하지 않고 현재 항목을 대체
                history.replaceState({ page: id }, '', hashUrl);
            }
            if (scrollableContainer) {
                scrollableContainer.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } else {
            console.error(`데이터에서 ID ${id}의 작품을 찾을 수 없습니다.`);
            renderArtwork(null);
            // 작품을 찾을 수 없는 경우에도 해시 경로를 업데이트
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

            // [수정] 초기 URL 파싱 로직: window.location.pathname 대신 window.location.hash 사용
            // 예: URL이 'leejeongmi.kr/#/artwork/7'일 경우 hashSegments는 ["#", "artwork", "7"]
            const hashSegments = window.location.hash.split('/');
            const lastHashSegment = hashSegments[hashSegments.length - 1]; // "7"

            let initialId = 1;

            if (hashSegments.includes('artwork') && !isNaN(parseInt(lastHashSegment))) {
                const parsedId = parseInt(lastHashSegment);
                if (parsedId >= 1 && parsedId <= artworks.length) {
                    initialId = parsedId;
                }
            }
            currentArtworkId = initialId;

            navigateToArtwork(currentArtworkId);

            // [수정] popstate 이벤트 핸들러: history.replaceState로 해시를 사용하므로
            // 초기 로드 시의 파싱과 동일하게 hash를 기반으로 동작하도록 함.
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
                currentArtworkId = popStateId; // 현재 작품 ID 업데이트

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

    function applyTransform() {
        // transform-origin: 50% 50%이므로, translate는 이미지의 중심을 이동시킴
        enlargedImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        enlargedImage.style.cursor = scale > 1 ? 'grab' : 'default';
    }

    function resetZoomPan() {
        scale = 1;
        translateX = 0;
        translateY = 0;
        applyTransform();
    }

    enlargedImage.addEventListener('wheel', (event) => {
        event.preventDefault();
        const scaleAmount = 0.1;
        const oldScale = scale;

        if (event.deltaY < 0) { // 휠 업: 확대
            scale += scaleAmount;
        } else { // 휠 다운: 축소
            scale -= scaleAmount;
        }

        scale = Math.max(0.5, Math.min(scale, 5)); // 최소 0.5배, 최대 5배 제한

        const rect = enlargedImage.getBoundingClientRect();

        // [수정] 문제 1 해결: 커서 위치를 이미지의 *현재 중심*을 기준으로 계산하여 확대/축소 기준점 보정
        const mouseXRelativeToCenter = event.clientX - (rect.left + rect.width / 2);
        const mouseYRelativeToCenter = event.clientY - (rect.top + rect.height / 2);

        // 스케일 변경으로 인해 마우스 위치(중심 기준)가 얼마나 이동하는지 계산
        const newMouseXRelativeToCenter = mouseXRelativeToCenter * (scale / oldScale);
        const newMouseYRelativeToCenter = mouseYRelativeToCenter * (scale / oldScale);

        // 이 이동량의 차이를 이미지 이동(translate)으로 보정
        translateX -= (newMouseXRelativeToCenter - mouseXRelativeToCenter);
        translateY -= (newMouseYRelativeToCenter - mouseYRelativeToCenter);

        applyTransform();
    });

    enlargedImage.addEventListener('mousedown', (event) => {
        if (scale > 1) { // 확대된 상태에서만 드래그 가능
            isDragging = true;
            // 현재 translate 값에서 마우스 클릭 위치를 빼서 드래그 시작점 설정
            startX = event.clientX - translateX;
            startY = event.clientY - translateY;
            enlargedImage.style.cursor = 'grabbing';
            enlargedImage.style.transition = 'none'; // 드래그 중 transition 비활성화
        }
    });

    enlargedImage.addEventListener('mousemove', (event) => {
        if (!isDragging) return;
        event.preventDefault();
        // 현재 마우스 위치에서 시작점을 빼서 새로운 translate 값 계산
        translateX = event.clientX - startX;
        translateY = event.clientY - startY;
        applyTransform();
    });

    enlargedImage.addEventListener('mouseup', () => {
        isDragging = false;
        enlargedImage.style.cursor = scale > 1 ? 'grab' : 'default';
        enlargedImage.style.transition = 'transform 0.1s ease-out'; // 드래그 끝난 후 transition 활성화
    });

    enlargedImage.addEventListener('mouseleave', () => {
        isDragging = false;
        enlargedImage.style.cursor = scale > 1 ? 'grab' : 'default';
        enlargedImage.style.transition = 'transform 0.1s ease-out'; // 드래그 끝난 후 transition 활성화
    });

    let touchStartX = 0, touchStartY = 0; // 터치 드래그 시작점
    let initialPinchDistance = 0; // 핀치 줌 시작 시 두 손가락 거리
    let initialZoomScale = 1; // 핀치 줌 시작 시 스케일
    let lastTapTime = 0; // 더블 탭 감지용

    enlargedImage.addEventListener('touchstart', (event) => {
        if (event.touches.length === 1) {
            isDragging = true;
            touchStartX = event.touches[0].clientX - translateX;
            touchStartY = event.touches[0].clientY - translateY;

            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTapTime;
            if (tapLength < 300 && tapLength > 0) { // 더블 탭 감지 (300ms 이내)
                event.preventDefault(); // 기본 더블 탭 줌 방지
                resetZoomPan(); // 더블 탭 시 초기화
            }
            lastTapTime = currentTime;

        } else if (event.touches.length === 2) {
            isDragging = false; // 두 손가락 핀치 시 드래그 비활성화
            initialPinchDistance = getPinchDistance(event.touches);
            initialZoomScale = scale;

            // 핀치 시작 시 두 손가락의 중심점 (이미지 요소의 좌측 상단 기준)
            const midX = (event.touches[0].clientX + event.touches[1].clientX) / 2;
            const midY = (event.touches[0].clientY + event.touches[1].clientY) / 2;

            const rect = enlargedImage.getBoundingClientRect();
            // 핀치 시작 시 이미지 중심을 기준으로 한 두 손가락의 중심점 위치 저장
            startX = midX - (rect.left + rect.width / 2); // startX는 이제 이미지 중심 기준
            startY = midY - (rect.top + rect.height / 2); // startY는 이제 이미지 중심 기준
        }
        enlargedImage.style.transition = 'none'; // 터치 중 transition 비활성화
    }, { passive: false });

    enlargedImage.addEventListener('touchmove', (event) => {
        event.preventDefault(); // 기본 브라우저 동작(스크롤, 줌 등) 방지

        if (isDragging && event.touches.length === 1) {
            // 한 손가락 드래그
            translateX = event.touches[0].clientX - touchStartX;
            translateY = event.touches[0].clientY - touchStartY;
            applyTransform();
        } else if (event.touches.length === 2 && initialPinchDistance > 0) {
            // 두 손가락 핀치 줌
            const currentPinchDistance = getPinchDistance(event.touches);
            const zoomFactor = currentPinchDistance / initialPinchDistance;

            scale = initialZoomScale * zoomFactor;
            scale = Math.max(0.5, Math.min(scale, 5)); // 최소 0.5배, 최대 5배 제한

            const rect = enlargedImage.getBoundingClientRect();
            // [수정] 문제 1 해결: 핀치 중심점을 이미지의 *현재 중심*을 기준으로 계산
            const pinchCenterXRelativeToCenter = ((event.touches[0].clientX + event.touches[1].clientX) / 2) - (rect.left + rect.width / 2);
            const pinchCenterYRelativeToCenter = ((event.touches[0].clientY + event.touches[1].clientY) / 2) - (rect.top + rect.height / 2);

            // 스케일 변경으로 인해 핀치 중심점(중심 기준)이 얼마나 이동하는지 계산
            const newPinchCenterXRelativeToCenter = pinchCenterXRelativeToCenter * (scale / initialZoomScale);
            const newPinchCenterYRelativeToCenter = pinchCenterYRelativeToCenter * (scale / initialZoomScale);

            // 이 이동량의 차이를 이미지 이동(translate)으로 보정
            translateX -= (newPinchCenterXRelativeToCenter - pinchCenterXRelativeToCenter);
            translateY -= (newPinchCenterYRelativeToCenter - pinchCenterYRelativeToCenter);

            applyTransform();
        }
    }, { passive: false });

    enlargedImage.addEventListener('touchend', () => {
        isDragging = false;
        initialPinchDistance = 0;
        initialZoomScale = scale; // 마지막 스케일을 유지하여 연속적인 핀치-줌 가능
        enlargedImage.style.transition = 'transform 0.1s ease-out'; // 터치 끝난 후 transition 활성화
    });

    function getPinchDistance(touches) {
        return Math.hypot(
            touches[1].pageX - touches[0].pageX,
            touches[1].pageY - touches[0].pageY
        );
    }
});
