// Login logic
async function login(event, type) {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const message = document.getElementById('message');

  const endpoint = type === 'volunteer' ? 'http://localhost:3000/api/volunteer/login' : 'http://localhost:3000/api/user/login';

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      message.textContent = "Login successful!";
      message.className = "text-green-500 text-center mt-2";
      setTimeout(() => {
        window.location.href = "dashboard.html"; // or another page
      }, 1000);
    } else {
      message.textContent = data.message || "Login failed.";
      message.className = "text-red-500 text-center mt-2";
    }
  } catch (error) {
    message.textContent = "Error logging in.";
    message.className = "text-red-500 text-center mt-2";
    console.error(error);
  }
}


// Animation logic
class Experience {
  constructor(container, width, height) {
    console.clear();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(0, 0);

    this.camera = new THREE.PerspectiveCamera(70, width / height, 1, 3000);
    this.camera.position.z = 200;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0xffffff, 0.0);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    this.fpsInterval = 1000 / 60;
    this.then = Date.now();

    this.scene = new THREE.Scene();
    this._addLights();
    this._addMeshes();
    this.resize();
    this.bind();
    this.loop();
  }

  _addLights() {
    this.scene.add(new THREE.AmbientLight(0x0));
    const spotLight = new THREE.SpotLight(0xf2056f, 0.68, 0);
    spotLight.position.set(150, 150, 0);
    this.scene.add(spotLight);
    const hemiLight = new THREE.HemisphereLight(0xd8c7f3, 0x61dafb, 1);
    this.scene.add(hemiLight);
  }

  _addMeshes() {
    const urls = [
      "https://robindelaporte.fr/codepen/play/nx.jpg",
      "https://robindelaporte.fr/codepen/play/ny.jpg",
      "https://robindelaporte.fr/codepen/play/nz.jpg",
      "https://robindelaporte.fr/codepen/play/px.jpg",
      "https://robindelaporte.fr/codepen/play/py.jpg",
      "https://robindelaporte.fr/codepen/play/pz.jpg"
    ];

    const loader = new THREE.CubeTextureLoader();
    const cubemap = loader.load(urls);

    const material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.1,
      transparent: true,
      reflectivity: 0.56,
      envMap: cubemap
    });

    const sphereGeometry = new THREE.SphereGeometry(24, 32, 32);
    this._sphere = new THREE.Mesh(sphereGeometry, material);
    this._sphere.position.set(-25, -30, 0);
    this.scene.add(this._sphere);

    const torusGeometry = new THREE.TorusGeometry(16, 8, 16, 100);
    this._torus = new THREE.Mesh(torusGeometry, material);
    this._torus.position.set(30, 30, 0);
    this._torus.rotation.set(2.3, 0.3, 0);
    this._torus.material.opacity = 0;
    this.scene.add(this._torus);

    const coneGeometry = new THREE.ConeGeometry(8, 16, 32);
    this._cone = new THREE.Mesh(coneGeometry, material);
    this._cone.position.set(-50, 12, 3);
    this._cone.rotation.set(-0.3, 0, 0.7);
    this.scene.add(this._cone);
  }

  animateIn() {
    gsap.to(this._torus.material, { duration: 0.6, opacity: 1 });
    gsap.fromTo(this._torus.scale, { x: 0.8 }, { duration: 0.6, x: 1.35 });
    gsap.fromTo(this._sphere.scale, { x: 0.8 }, { duration: 0.6, x: 1.15 });
    gsap.fromTo(this._cone.scale, { x: 0.8 }, { duration: 0.6, x: 1.35 });
  }

  animateOut() {
    gsap.to(this._torus.material, { duration: 0.6, opacity: 0 });
    gsap.to(this._torus.scale, { duration: 0.6, x: 0.8 });
    gsap.to(this._sphere.scale, { duration: 0.6, x: 0.8 });
    gsap.to(this._cone.scale, { duration: 0.6, x: 0.8 });
  }

  bind() {
    window.addEventListener('resize', this.resize.bind(this), false);
    document.body.addEventListener("mousemove", this.onMouseMove.bind(this), false);

    const hoverArea = document.querySelector("a");
    if (hoverArea) {
      hoverArea.addEventListener("mouseenter", () => this.animateIn());
      hoverArea.addEventListener("mouseleave", () => this.animateOut());
    }
  }

  onMouseMove(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  loop() {
    this.raf = requestAnimationFrame(this.loop.bind(this));
    const now = Date.now();
    const delta = now - this.then;

    if (delta > this.fpsInterval) {
      this.camera.position.x += this.mouse.x * (window.innerWidth * 0.02) - this.camera.position.x * 0.03;
      this.camera.position.y += -this.mouse.y * (window.innerHeight * 0.02) - this.camera.position.y * 0.03;
      this.camera.lookAt(this.scene.position);

      this.renderer.render(this.scene, this.camera);
      this.then = now;
    }
  }

  resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}

// Start animation
const container = document.querySelector('.home');
if (container) {
  new Experience(container, window.innerWidth, window.innerHeight);
}
