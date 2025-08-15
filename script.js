// Global variables
let scene, camera, renderer;
let cube, sphere, torus;
let currentModel = 'cube';
let rotationSpeed = 0.01;
let isMouseDown = false;
let mouseX = 0, mouseY = 0;
let frameCount = 0;
let lastTime = Date.now();

// Initialize animated background
function initBackground() {
    const bgAnimation = document.getElementById('bgAnimation');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 5) + 's';
        bgAnimation.appendChild(particle);
    }
}

// Initialize the 3D scene
function init() {
    // Get viewport element
    const viewport = document.getElementById('viewport');
    
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);

    // Camera setup
    camera = new THREE.PerspectiveCamera(
        75,
        viewport.clientWidth / viewport.clientHeight,
        0.1,
        1000
    );
    camera.position.z = 5;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(viewport.clientWidth, viewport.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    viewport.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Create 3D models
    createModels();

    // Ground plane
    const planeGeometry = new THREE.PlaneGeometry(10, 10);
    const planeMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -2;
    plane.receiveShadow = true;
    scene.add(plane);

    // Event listeners
    setupEventListeners();

    // Hide loading screen
    document.getElementById('loading').style.display = 'none';

    // Start animation
    animate();
}

function createModels() {
    // Cube
    const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
    const cubeMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x00ff88,
        wireframe: false 
    });
    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.castShadow = true;
    cube.visible = true;
    scene.add(cube);

    // Sphere
    const sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const sphereMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x00ff88,
        wireframe: false 
    });
    sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.castShadow = true;
    sphere.visible = false;
    scene.add(sphere);

    // Torus
    const torusGeometry = new THREE.TorusGeometry(1.2, 0.4, 16, 100);
    const torusMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x00ff88,
        wireframe: false 
    });
    torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.castShadow = true;
    torus.visible = false;
    scene.add(torus);
}

function setupEventListeners() {
    // Mouse controls
    renderer.domElement.addEventListener('mousemove', (event) => {
        if (isMouseDown) {
            const rect = renderer.domElement.getBoundingClientRect();
            mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            camera.position.x = mouseX * 3;
            camera.position.y = mouseY * 3;
            camera.lookAt(0, 0, 0);
        }
    });

    renderer.domElement.addEventListener('mousedown', () => {
        isMouseDown = true;
        document.body.style.cursor = 'grabbing';
    });

    renderer.domElement.addEventListener('mouseup', () => {
        isMouseDown = false;
        document.body.style.cursor = 'default';
    });

    // Tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            document.getElementById(`tab-${button.dataset.tab}`).classList.add('active');
        });
    });

    // Model selection
    document.querySelectorAll('.model-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.model-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            currentModel = card.dataset.model;
            card.querySelector('input').checked = true;
            updateModelVisibility();
            updateModelInfo();
        });
    });

    // Color picker
    document.getElementById('colorPicker').addEventListener('input', (e) => {
        const color = e.target.value;
        updateModelColor(color);
    });

    // Speed slider
    document.getElementById('speedSlider').addEventListener('input', (e) => {
        rotationSpeed = parseFloat(e.target.value);
        document.getElementById('speedDisplay').textContent = rotationSpeed.toFixed(3);
    });

    // Wireframe toggle
    document.getElementById('wireframeToggle').addEventListener('click', (e) => {
        e.currentTarget.classList.toggle('active');
        const wireframe = e.currentTarget.classList.contains('active');
        updateWireframe(wireframe);
    });

    // Reset camera
    document.getElementById('resetCamera').addEventListener('click', () => {
        camera.position.set(0, 0, 5);
        camera.lookAt(0, 0, 0);
    });

    // Window resize
    window.addEventListener('resize', onWindowResize);
}

function updateModelVisibility() {
    cube.visible = currentModel === 'cube';
    sphere.visible = currentModel === 'sphere';
    torus.visible = currentModel === 'torus';
}

function updateModelColor(color) {
    const threeColor = new THREE.Color(color);
    cube.material.color = threeColor;
    sphere.material.color = threeColor;
    torus.material.color = threeColor;
}

function updateWireframe(wireframe) {
    cube.material.wireframe = wireframe;
    sphere.material.wireframe = wireframe;
    torus.material.wireframe = wireframe;
}

function updateModelInfo() {
    const modelName = document.getElementById('modelName');
    const modelDescription = document.getElementById('modelDescription');
    
    modelName.textContent = currentModel.charAt(0).toUpperCase() + currentModel.slice(1);
    
    const descriptions = {
        'cube': 'Box geometry with 6 faces',
        'sphere': 'Sphere with 32x32 segments',
        'torus': 'Torus with custom radius'
    };
    
    modelDescription.textContent = descriptions[currentModel];
}

function updateFPS() {
    frameCount++;
    const now = Date.now();
    if (now - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (now - lastTime));
        document.getElementById('fpsCounter').textContent = fps;
        frameCount = 0;
        lastTime = now;
    }
}

function onWindowResize() {
    const viewport = document.getElementById('viewport');
    camera.aspect = viewport.clientWidth / viewport.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(viewport.clientWidth, viewport.clientHeight);
}

function animate() {
    requestAnimationFrame(animate);

    // Update FPS counter
    updateFPS();

    // Rotate the active model
    if (currentModel === 'cube' && cube.visible) {
        cube.rotation.x += rotationSpeed;
        cube.rotation.y += rotationSpeed;
    }
    if (currentModel === 'sphere' && sphere.visible) {
        sphere.rotation.x += rotationSpeed;
        sphere.rotation.y += rotationSpeed;
    }
    if (currentModel === 'torus' && torus.visible) {
        torus.rotation.x += rotationSpeed;
        torus.rotation.y += rotationSpeed;
    }

    renderer.render(scene, camera);
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', () => {
    initBackground();
    init();
});