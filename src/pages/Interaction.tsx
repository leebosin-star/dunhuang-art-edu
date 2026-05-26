import { useRef, useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

// 修复 file:// 协议下 GLB 模型无法通过 fetch() 加载的问题
// Chrome 阻止 file:// 页面的 fetch 请求，需回退到 XMLHttpRequest
if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
  const FileLoader = (THREE as any).FileLoader
  if (FileLoader) {
    const origLoad = FileLoader.prototype.load
    FileLoader.prototype.load = function (
      url: string,
      onLoad?: (data: any) => void,
      onProgress?: (e: ProgressEvent) => void,
      onError?: (e: any) => void,
    ) {
      if (typeof url === 'string' && (url.startsWith('./') || url.startsWith('../') || url.startsWith('/'))) {
        const xhr = new XMLHttpRequest()
        xhr.open('GET', url, true)
        xhr.responseType = this.responseType === 'text' ? 'text' : 'arraybuffer'
        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 0) {
            let result = xhr.response
            if (this.responseType === 'text' || this.responseType === 'json') {
              result = xhr.responseText
            }
            onLoad?.(result)
          } else {
            onError?.(new Error(`XHR failed: ${xhr.status} ${url}`))
          }
        }
        xhr.onerror = () => onError?.(new Error(`XHR error: ${url}`))
        if (onProgress) {
          xhr.onprogress = (e) => {
            if (e.lengthComputable) onProgress(e)
          }
        }
        xhr.send()
        return xhr
      }
      return origLoad.call(this, url, onLoad, onProgress, onError)
    }
  }
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  uniform float uSkirtWave;

  varying float vAlpha;

  float hash(float n) { return fract(sin(n) * 43758.5453123); }

  void main() {
    vec3 pos = position;
    float idx = float(gl_VertexID);

    vec3 randDir = normalize(vec3(
      hash(idx * 0.13) - 0.5,
      hash(idx * 0.27) - 0.5,
      hash(idx * 0.41) - 0.5
    ));

    // --- 程序化微动作（散射时渐隐） ---
    float poseFade = 1.0 - uProgress;

    // 呼吸感：躯干区域 (Y: -0.3 ~ 0.35) 轻微缩放
    float torsoMask = smoothstep(0.35, 0.2, pos.y) * smoothstep(-0.3, -0.15, pos.y);
    float breath = sin(uTime * 0.9 + hash(idx) * 1.5) * 0.015;
    pos.x += pos.x * breath * torsoMask * poseFade;
    pos.z += pos.z * breath * 0.6 * torsoMask * poseFade;

    // 手臂微摆：上半身两侧区域 (Y > 0.0, |X| > 0.2)
    float armMask = smoothstep(0.0, 0.15, pos.y) * smoothstep(0.2, 0.35, abs(pos.x));
    float armSway = sin(uTime * 1.1 + pos.y * 3.0) * 0.02;
    pos.x += armSway * armMask * poseFade;
    pos.z += cos(uTime * 0.8 + pos.y * 2.5) * 0.01 * armMask * poseFade;

    // 头部轻摇：顶部区域 (Y > 0.4)
    float headMask = smoothstep(0.4, 0.5, pos.y);
    float headTilt = sin(uTime * 0.7) * 0.018;
    pos.x += headTilt * headMask * poseFade;
    pos.z += cos(uTime * 0.65) * 0.012 * headMask * poseFade;

    vec3 jitter = vec3(
      sin(uTime * 2.0 + pos.x * 20.0),
      cos(uTime * 2.3 + pos.y * 20.0),
      sin(uTime * 1.9 + pos.z * 20.0)
    ) * 0.004 * (1.0 - uProgress);
    pos += jitter;

    pos += randDir * (uProgress * 2.5);

    pos *= 1.3;
    pos.y -= 0.2;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = (1.2 + uProgress * 2.0) * (1.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;

    vAlpha = 1.0 - uProgress * 0.85;
  }
`

const dunhuangColors: [number, number, number][] = [
  [0.831, 0.722, 0.478], // 浅金
  [0.769, 0.478, 0.427], // 朱砂
  [0.545, 0.643, 0.627], // 青绿
  [0.357, 0.482, 0.604], // 石青
  [0.969, 0.957, 0.937], // 月白
  [0.788, 0.659, 0.553], // 浅赭
]

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    float r = dot(cxy, cxy);
    if (r > 1.0) discard;

    float intensity = 1.0 - r;
    intensity = pow(intensity, 2.0);

    gl_FragColor = vec4(uColor * intensity, intensity * vAlpha * 0.18);
  }
`

export default function Interaction() {
  const containerRef = useRef<HTMLDivElement>(null)
  const shaderRef = useRef<THREE.ShaderMaterial | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const handLandmarkerRef = useRef<any>(null)
  const isWebcamReadyRef = useRef(false)
  const pointsMeshRef = useRef<THREE.Points | null>(null)
  const [statusText, setStatusText] = useState('正在加载舞女模型...')
  const [colorIndex, setColorIndex] = useState(0)
  const [cameraFailed, setCameraFailed] = useState(false)
  const navigate = useNavigate()

  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth < 1024
  )
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (isMobile) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0F0D0B', color:'#F9F5EB', textAlign:'center', padding:'40px 20px', fontFamily:'"Noto Serif SC",serif' }}>
        <div>
          <p style={{ fontSize:'1.5rem', marginBottom:'16px', color:'#D7B072' }}>请使用电脑打开实时互动体验</p>
          <p style={{ fontSize:'0.9rem', opacity:0.5, lineHeight:1.8 }}>实时互动体验需要摄像头与较大的屏幕空间<br/>请使用桌面端浏览器访问本页面</p>
        </div>
      </div>
    )
  }

  const retryCamera = useCallback(async () => {
    setCameraFailed(false)
    setStatusText('正在启用摄像头...')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      const video = videoRef.current
      if (!video) {
        stream.getTracks().forEach((t) => t.stop())
        return
      }
      video.addEventListener(
        'loadeddata',
        () => {
          isWebcamReadyRef.current = true
          if (pointsMeshRef.current && handLandmarkerRef.current) {
            setStatusText('系统就绪！请伸手互动')
          }
        },
        { once: true },
      )
      video.srcObject = stream
      await video.play()
    } catch {
      setStatusText('摄像头未授权，请点击按钮重试')
      setCameraFailed(true)
    }
  }, [])

  const cycleColor = useCallback(() => {
    setColorIndex((i) => {
      const next = (i + 1) % dunhuangColors.length
      if (shaderRef.current) {
        shaderRef.current.uniforms.uColor.value = dunhuangColors[next]
      }
      return next
    })
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let mounted = true

    // --- Scene setup ---
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x0F0D0B, 0.08)

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      100,
    )
    camera.position.set(0, 0, 3)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.4

    const shaderMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uSkirtWave: { value: 0 },
        uColor: { value: dunhuangColors[0] },
      },
    })
    shaderRef.current = shaderMaterial

    let pointsMesh: THREE.Points | null = null
    let currentProgress = 0
    let targetProgress = 0
    let handVelocityX = 0
    let currentSkirtWave = 0
    let currentRotationY = 0
    let smoothedDistance = 0
    const timer = new THREE.Timer()

    // --- Load GLB ---
    const loader = new GLTFLoader()
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('https://unpkg.com/three@0.184.0/examples/jsm/libs/draco/')
    loader.setDRACOLoader(dracoLoader)

    loader.load(
      './modelToUsed-v1.glb',
      (gltf) => {
        if (!mounted) return
        let targetGeometry: THREE.BufferGeometry | null = null
        gltf.scene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).geometry) {
            targetGeometry = (child as THREE.Mesh).geometry
          }
        })

        if (!targetGeometry) {
          setStatusText('错误：模型中未找到有效网格')
          return
        }

        pointsMeshRef.current = new THREE.Points(targetGeometry, shaderMaterial)
        scene.add(pointsMeshRef.current)
        pointsMesh = pointsMeshRef.current
        setStatusText((prev) => {
          if (prev.includes('摄像头')) return '系统就绪！请伸手互动'
          if (isWebcamReadyRef.current && handLandmarkerRef.current) return '系统就绪！请伸手互动'
          return '粒子就绪，正在开启摄像头...'
        })
      },
      (xhr) => {
        if (!mounted) return
        const percent = Math.round((xhr.loaded / xhr.total) * 100)
        if (percent > 0) setStatusText(`解压并注入 GPU: ${percent}%`)
      },
      () => {
        if (!mounted) return
        setStatusText('模型加载失败，请检查文件')
      },
    )

    // --- MediaPipe Hands ---
    let frameCount = 0
    const video = document.createElement('video')
    video.setAttribute('playsinline', '')
    video.setAttribute('autoplay', '')
    video.setAttribute('muted', '')
    video.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0.01;pointer-events:none;z-index:-1'
    document.body.appendChild(video)
    videoRef.current = video

    async function initMediaPipe() {
      try {
        const MP_WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
        const MP_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18'

        const nativeImport = new Function('url', 'return import(url)')
        const { FilesetResolver, HandLandmarker } = await nativeImport(MP_URL)

        if (!mounted) return false

        const vision = await FilesetResolver.forVisionTasks(MP_WASM)
        if (!mounted) return false

        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 1,
        })
        return true
      } catch (err) {
        console.error('MediaPipe 启动失败:', err)
        return false
      }
    }

    async function tryCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        video.addEventListener(
          'loadeddata',
          () => {
            if (!mounted) return
            isWebcamReadyRef.current = true
            if (pointsMeshRef.current && handLandmarkerRef.current) {
              setStatusText('系统就绪！请伸手互动')
            }
          },
          { once: true },
        )
        video.srcObject = stream
        await video.play()
        if (mounted) {
          setCameraFailed(false)
        }
      } catch {
        if (mounted) {
          setCameraFailed(true)
          setStatusText('点击下方按钮启用摄像头')
        }
      }
    }

    Promise.all([tryCamera(), initMediaPipe()]).then(() => {
      if (!mounted) return
      if (video.srcObject && handLandmarkerRef.current && !isWebcamReadyRef.current) {
        isWebcamReadyRef.current = true
        if (pointsMeshRef.current) {
          setStatusText('系统就绪！请伸手互动')
        }
      }
    })

    // --- Animation loop ---
    let animId: number
    function animate() {
      animId = requestAnimationFrame(animate)
      const elapsedTime = timer.getElapsed()

      frameCount++
      if (handLandmarkerRef.current && isWebcamReadyRef.current) {
        try {
          const detections = handLandmarkerRef.current.detectForVideo(video, performance.now())

          if (detections.landmarks && detections.landmarks.length > 0) {
            const landmarks = detections.landmarks[0]
            const wrist = landmarks[0]
            const tips = [landmarks[8], landmarks[12], landmarks[16], landmarks[20]]

            let totalDistance = 0
            tips.forEach((tip: any) => {
              totalDistance += Math.hypot(tip.x - wrist.x, tip.y - wrist.y, tip.z - wrist.z)
            })
            const rawDistance = totalDistance / tips.length
            smoothedDistance += (rawDistance - smoothedDistance) * 0.35

            if (smoothedDistance > 0.25) {
              targetProgress = 1.0
            } else if (smoothedDistance < 0.23) {
              targetProgress = 0.0
            }

            handVelocityX = (landmarks[9].x - 0.5) * 2.0
          } else {
            targetProgress = 0.0
            handVelocityX = 0
          }
        } catch {
          // detectForVideo 偶发异常，忽略本帧
        }
      }

      const speed = targetProgress < currentProgress ? 0.12 : 0.008
      currentProgress += (targetProgress - currentProgress) * speed
      currentSkirtWave += (handVelocityX - currentSkirtWave) * 0.08
      currentRotationY += (handVelocityX * 1.8 - currentRotationY) * 0.15

      if (pointsMesh) {
        shaderMaterial.uniforms.uTime.value = elapsedTime
        shaderMaterial.uniforms.uProgress.value = currentProgress
        shaderMaterial.uniforms.uSkirtWave.value = currentSkirtWave * (1.0 - currentProgress)
        pointsMesh.rotation.y = currentRotationY
      }

      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // --- Resize ---
    function onResize() {
      if (!container) return
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }
    window.addEventListener('resize', onResize)

    // --- Cleanup ---
    return () => {
      mounted = false
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)

      // 优先停止摄像头，确保离开页面时摄像头立即关闭
      try {
        if (video.srcObject) {
          const stream = video.srcObject as MediaStream
          stream.getTracks().forEach((t) => t.stop())
        }
        video.remove()
        handLandmarkerRef.current?.close()
      } catch (e) {
        console.error('摄像头清理失败:', e)
      }

      // 清理 Three.js 资源
      try {
        renderer.dispose()
        shaderMaterial.dispose()
        scene.clear()
        controls.dispose()
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement)
        }
      } catch (e) {
        // Three.js 清理失败不影响主流程
      }
    }
  }, [])

  const colorNames = ['浅金', '朱砂', '青绿', '石青', '月白', '浅赭']

  return (
    <div className="absolute inset-0 bg-[#0F0D0B]">
      <div ref={containerRef} className="absolute inset-0" />

      {/* 左上区块 */}
      <div className="absolute top-5 left-5 z-10 flex flex-col gap-2">
        <div className="bg-[#151310]/90 px-4 py-2.5 rounded-xl backdrop-blur-sm border border-dunhuang-gold/15 shadow-lg">
          <p className="text-dunhuang-gold/90 text-xs font-medium m-0">{statusText}</p>
          <p className="text-[#F9F5EB]/25 text-[10px] mt-1 m-0 leading-relaxed">
            张开手掌：粒子消散 &nbsp;|&nbsp; 握拳：粒子汇聚
          </p>
        </div>
        <button
          onClick={cycleColor}
          className="bg-[#151310]/90 px-4 py-2.5 rounded-xl backdrop-blur-sm border border-dunhuang-gold/20 text-dunhuang-gold/80 text-sm font-medium cursor-pointer hover:bg-[#151310] hover:border-dunhuang-gold/40 transition-all duration-300"
        >
          {colorNames[colorIndex]}
        </button>
      </div>

      {/* 摄像头激活弹窗 */}
      {cameraFailed && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0F0D0B]/70 backdrop-blur-sm">
          <div className="bg-[#151310] border border-dunhuang-gold/20 rounded-2xl px-10 py-8 text-center shadow-2xl max-w-sm">
            <svg className="w-12 h-12 mx-auto mb-4 text-dunhuang-gold/50" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-[#F9F5EB]/50 text-sm mb-6 leading-relaxed">需要开启摄像头进行手势识别<br />开启后，伸手即可与敦煌粒子互动</p>
            <button
              onClick={retryCamera}
              className="px-8 py-3 rounded-xl bg-dunhuang-jade text-white text-sm font-medium hover:bg-dunhuang-blue transition-all duration-300 active:scale-[0.98]"
            >
              启用摄像头
            </button>
          </div>
        </div>
      )}

      {/* 右上：返回键 */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-5 right-5 z-10 bg-[#151310]/90 px-4 py-2.5 rounded-xl backdrop-blur-sm border border-[#C9A084]/10 text-[#F9F5EB]/30 text-sm cursor-pointer hover:bg-[#151310] hover:text-dunhuang-gold/70 hover:border-dunhuang-gold/25 transition-all duration-300"
      >
        返回
      </button>

    </div>
  )
}
