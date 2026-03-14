🛠 Project Setup & Collaboration Guide (Gun Adventure)

本指南用于规范团队在 第一周（里程碑 1）的开发契约，确保底层架构（A）与资源表现（B）无缝对接。//A B 分别对应任务2 两人

1. 核心技术契约 (Core Contract)

为了达成 NFR-1 (60 FPS) 和 NFR-2 (像素风)，全体成员必须遵守以下参数：

| 参数名称 | 设定值 | 说明 |
| 逻辑分辨率 | `320 x 180` | 全局坐标基准，由 A 负责拉伸至浏览器窗口。 |
| 目标帧率 | `60 FPS` | 使用 `requestAnimationFrame` 进行恒定帧率控制。 |
| 资源路径 | `/public/assets/` | 所有图片、音效统一存放在此，方便 Vite 静态引用。 |
| 渲染顺序 | 背景 -> 实体 -> UI | 严格遵守此顺序，防止画面遮挡冲突。 |


2. 目录结构规范 (Directory Structure)

请按照以下结构组织代码，禁止在根目录乱放文件：

```text
/src
  /core         # 游戏循环、状态机、D20 引擎 (由 A 主导)
  /renderer     # Canvas 渲染逻辑、资产加载 (由 B 主导)
  /entities     # 玩家、敌人、子弹类定义
  /utils        # 数值计算、碰撞检测辅助函数
  /config.js    # 全局常量定义 (宽高、速度等)
/public
  /assets       # 像素素材、音效文件
```

3. 开发对齐流程 (Step-by-Step)

第一步：初始化全局变量 (`src/config.js`)

由 A 创建，双方共同维护。

```javascript
export const CONFIG = {
  WIDTH: 320,
  HEIGHT: 180,
  GRID_SIZE: 16, // 像素对齐基准
  DEBUG: true    // 开启后显示 FPS 和碰撞盒
};

```

第二步：资源加载协议 (`src/renderer/assetLoader.js`)

由 B 编写，A 调用。

B 的职责：编写 `loadAllAssets()` 函数，返回一个 Promise。
A 的职责：在 `main.js` 中 `await loadAllAssets()`，加载完成后再启动游戏循环。

第三步：渲染接口对接

B 提供接口：`drawEntities(ctx, state)`。
A 执行循环：
```javascript
function gameLoop() {
  ctx.clearRect(0, 0, 320, 180); // 清屏
  renderBackground(ctx);         // A 负责
  drawEntities(ctx, gameState);  // B 负责
  renderUI(ctx);                // B 负责
  requestAnimationFrame(gameLoop);
}

```

4. 给美术与开发 C 的备注

* 美术素材：请提供 `.png` 格式，角色动作请排列在同一张 Sprite Sheet 上，并告知 B 每帧的具体像素尺寸。
角色 (Player/Enemies)：建议为 16*16 像素。
子弹 (Bullets)：建议为 4*4 或 $8*8 像素。
环境/瓦片 (Tiles)：建议固定为 16*16 像素。

开发 C (射击功能)：请在 `src/entities/bullet.js` 中编写逻辑，位置更新请参考 `CONFIG.WIDTH/HEIGHT` 以防超出边界。


5. Git 提交规范

分支策略：所有开发在 `develop` 分支进行，严禁直接推送至 `main`。
提交信息：使用英文，格式为 `type: description` (例如 `feat: add player movement` 或 `fix: resolve canvas flickering`)。
