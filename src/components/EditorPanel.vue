import { useOutsideClose } from '../composables/useOutsideClose'
import { onMounted } from 'vue'
// ...既存のimportやsetupコード...
const { registerOutsideClose } = useOutsideClose()

onMounted(() => {
  registerOutsideClose({
    isOpen: () => isTextStylePopoverOpen.value,
    getHost: () => textStyleMenuRef.value,
    onClose: () => { isTextStylePopoverOpen.value = false }
  })
  registerOutsideClose({
    isOpen: () => isDividerPopoverOpen.value,
    getHost: () => dividerMenuRef.value,
    onClose: () => { isDividerPopoverOpen.value = false }
  })
  // 必要に応じて他のポップオーバーも同様に追加
})
<template>
  <section class="panel">
    <div class="panel-header">
      <div class="toolbar">
        <div class="toolbar-items">
            <ToolButton short="B" label="太字" @click="toggleBold" />
            <ToolButton short="I" label="斜体" @click="toggleItalic" />
            <ToolButton short="U" label="下線" @click="toggleUnderline" />
            <ToolButton short="S" label="取り消し" @click="toggleStrike" />

            <span class="toolbar-divider" aria-hidden="true" />

            <ToolSelect
              v-model="fontSizeSelect"
              class="toolbar-select"
              label="サイズ"
              aria-label="文字サイズ"
              @mousedown="captureSelection"
              @focus="captureSelection"
              @change="onFontSizeChange"
            >
              <BaseOption v-for="n in fontSizeOptions" :key="`fs-${n}`" :value="String(n)">
                {{ n }}px
              </BaseOption>
              <template #after>
                <ToolButton
                  class="toolbar-nudge"
                  short="A-"
                  :prevent-mouse-down="true"
                  @mousedown="captureSelection"
                  @click="nudgeFontSize(-1)"
                />
                <ToolButton
                  class="toolbar-nudge"
                  short="A+"
                  :prevent-mouse-down="true"
                  @mousedown="captureSelection"
                  @click="nudgeFontSize(1)"
                />
              </template>
            </ToolSelect>

            <ToolSelect
              v-model="docFontSelect"
              class="toolbar-select"
              label="フォント"
              aria-label="フォント"
              @mousedown="captureSelection"
              @focus="captureSelection"
              @change="onFontFamilyChange"
            >
              <BaseOption value="system">標準（ゴシック）</BaseOption>
              <BaseOption value="gothic">日本語ゴシック</BaseOption>
              <BaseOption value="mincho">日本語明朝</BaseOption>
              <BaseOption value="serif">セリフ</BaseOption>
              <BaseOption value="mono">等幅</BaseOption>
            </ToolSelect>

                        <div ref="colorMenuRef" class="toolbar-color-menu">
              <ToolButton short="C" label="色" :prevent-mouse-down="true" @click="toggleColorPopover" />
              <BasePopover
                :open="isColorPopoverOpen"
                class="color-popover"
                aria-label="色メニュー"
              >
                  <ColorSection
                    title="テキストの色"
                    id-prefix="fg"
                    :palette="textColors"
                    :recent-colors="recentTextColors"
                    v-model:picker="newTextColor"
                    v-model:code="newTextColorCode"
                    placeholder="#111827"
                    @apply="applyTextColor"
                    @add="addRecentTextColor"
                  />

                  <ColorSection
                    title="背景の色"
                    id-prefix="bg"
                    :palette="backgroundColors"
                    :recent-colors="recentBackgroundColors"
                    v-model:picker="newBackgroundColor"
                    v-model:code="newBackgroundColorCode"
                    placeholder="#ffffff"
                    @apply="applyBackgroundColor"
                    @add="addRecentBackgroundColor"
                  />
              </BasePopover>
            </div>

            <div ref="linkMenuRef" class="toolbar-color-menu">
              <ToolButton
                short="L"
                label="リンク"
                :prevent-mouse-down="true"
                @mousedown="captureSelection"
                @click="toggleLinkPopover"
              />
              <BasePopover
                :open="isLinkPopoverOpen"
                class="color-popover"
                aria-label="リンク"
              >
                <div class="color-popover-section">
                  <div class="color-popover-title">リンク</div>
                  <div class="color-popover-subtitle">選択中の文字はそのままリンク化 / 未選択なら入力文字を挿入</div>
                  <div class="link-popover-grid">
                    <label class="link-popover-field">
                      <span class="link-popover-label">表示文字</span>
                      <input
                        v-model="linkText"
                        class="link-input"
                        placeholder="例: 公式サイト"
                        @keydown.enter.prevent="applyLinkFromPopover"
                      >
                    </label>
                    <label class="link-popover-field">
                      <span class="link-popover-label">URL</span>
                      <input
                        v-model="linkUrl"
                        class="link-input link-input-mono"
                        placeholder="https://example.com"
                        @keydown.enter.prevent="applyLinkFromPopover"
                      >
                    </label>

                    <label class="link-popover-field">
                      <span class="link-popover-label">見出しへリンク</span>
                      <BaseSelect
                        v-model="linkHeadingId"
                        class="link-select"
                        @change="onLinkHeadingSelectChange"
                      >
                        <BaseOption value="">（URLを直接入力）</BaseOption>
                        <BaseOption
                          v-for="h in headingAnchorOptions"
                          :key="h.id"
                          :value="h.id"
                        >
                          {{ h.label }}
                        </BaseOption>
                      </BaseSelect>
                    </label>
                  </div>
                  <div class="link-popover-actions">
                    <button type="button" class="color-add-button" @click="applyLinkFromPopover">挿入</button>
                    <button type="button" class="color-add-button" @click="closeLinkPopover">閉じる</button>
                  </div>
                </div>
              </BasePopover>
            </div>

            <span class="toolbar-divider" aria-hidden="true" />

            <ToolButton short="↦" label="インデント+" :prevent-mouse-down="true" @click="indentIncrease" />
            <ToolButton short="↤" label="インデント-" :prevent-mouse-down="true" @click="indentDecrease" />

            <span class="toolbar-divider" aria-hidden="true" />

            <div ref="columnsMenuRef" class="toolbar-color-menu">
              <ToolButton short="Ⅱ" label="二段組" :prevent-mouse-down="true" @click="toggleColumnsPopover" />
              <BasePopover
                :open="isColumnsPopoverOpen"
                class="color-popover"
                aria-label="二段組"
              >
                <div class="color-popover-section">
                  <div class="color-popover-title">二段組</div>
                  <div class="color-popover-subtitle">選択範囲またはカーソル位置の要素だけを縦二段で表示します</div>

                  <div class="link-popover-grid">
                    <label class="link-popover-field">
                      <span class="link-popover-label">左列の幅 (%)</span>
                      <div style="display:flex;gap:8px;align-items:center;">
                        <input
                          type="range"
                          min="10"
                          max="90"
                          step="1"
                          v-model.number="twoColumnWidthPercent"
                          style="flex:1;min-width:0;"
                        >
                        <input
                          type="number"
                          min="10"
                          max="90"
                          step="1"
                          v-model.number="twoColumnWidthPercent"
                          class="link-input link-input-mono"
                          style="width:96px;"
                        >
                      </div>
                    </label>

                    <label class="link-popover-field" style="flex-direction:row;align-items:center;gap:8px;">
                      <input type="checkbox" v-model="twoColDividerEnabled">
                      <span class="link-popover-label" style="margin:0;">区切り線を入れる</span>
                      <input
                        type="color"
                        class="color-picker"
                        :value="twoColDividerColor"
                        :disabled="!twoColDividerEnabled"
                        aria-label="縦線の色"
                        style="margin-left:auto;"
                        @input="onTwoColDividerColorInput"
                      >
                      <button type="button" class="color-add-button" style="height:32px; margin-left:8px;" @click="setTwoColDividerColorFromTextColor">文字色から反映</button>
                    </label>
                  </div>

                  <div class="link-popover-actions">
                    <button type="button" class="color-add-button" @click="applyTwoColumns(true)">適用</button>
                    <button type="button" class="color-add-button" @click="applyTwoColumns(false)">解除</button>
                    <button type="button" class="color-add-button" @click="isColumnsPopoverOpen = false">閉じる</button>
                  </div>
                </div>
              </BasePopover>
            </div>
        </div>
        <div class="toolbar-items">
            <div ref="themeMenuRef" class="toolbar-color-menu">
              <ToolButton short="T" label="テーマ色" :prevent-mouse-down="true" @click="toggleThemePopover" />
              <BasePopover
                :open="isThemePopoverOpen"
                class="color-popover"
                aria-label="テーマ色"
              >
                <div class="color-popover-section">
                  <div class="color-popover-title">テーマ色</div>
                  <div class="color-popover-subtitle">サイドバーのアクティブ色と見出しのスタイル色に反映</div>
                  <div class="color-add-row">
                    <input
                      type="color"
                      class="color-picker"
                      :value="themeAccentDraft"
                      aria-label="テーマ色ピッカー"
                      @input="onThemeAccentPickerInput"
                    >
                    <input
                      v-model="themeAccentCodeDraft"
                      class="color-code"
                      aria-label="テーマ色コード"
                      placeholder="#dadadd"
                      @keydown.enter.prevent="applyThemeAccentFromCode"
                    >
                    <button type="button" class="color-add-button" @click="applyThemeAccentFromCode">適用</button>
                  </div>
                </div>

                <div class="color-popover-section">
                  <div class="color-popover-title">背景色</div>
                  <div class="color-popover-subtitle">エディタ内(本文エリア)の背景色</div>
                  <div class="color-add-row">
                    <input
                      type="color"
                      class="color-picker"
                      :value="docBgCode"
                      aria-label="背景色ピッカー"
                      @input="onDocBgPickerInput"
                    >
                    <input
                      v-model="docBgCode"
                      class="color-code"
                      aria-label="背景色コード"
                      placeholder="#f9fafb"
                      @keydown.enter.prevent="applyDocBgFromCode"
                    >
                    <button type="button" class="color-add-button" @click="applyDocBgFromCode">適用</button>
                  </div>
                </div>

                <div class="color-popover-section">
                  <div class="color-popover-title">文字色</div>
                  <div class="color-popover-subtitle">エディタ内(本文エリア)の文字色</div>
                  <div class="color-add-row">
                    <input
                      type="color"
                      class="color-picker"
                      :value="docTextColorCode"
                      aria-label="文字色ピッカー"
                      @input="onDocTextColorPickerInput"
                    >
                    <input
                      v-model="docTextColorCode"
                      class="color-code"
                      aria-label="文字色コード"
                      placeholder="#111827"
                      @keydown.enter.prevent="applyDocTextColorFromCode"
                    >
                    <button type="button" class="color-add-button" @click="applyDocTextColorFromCode">適用</button>
                  </div>
                </div>

                
                <div style="margin-top: 8px; display: flex; justify-content: flex-end;">
                  <button type="button" class="color-add-button" @click="resetThemeAccent">テーマ設定を初期化</button>
                </div>
              </BasePopover>
            </div>

            <div
              v-for="m in headingMenus"
              :key="m.level"
              :ref="(el) => setHeadingMenuEl(m.level, el)"
              class="toolbar-style-menu"
            >
              <ToolButton
                :short="m.short"
                :label="`スタイル: ${headingStyleLabel(getHeadingStyle(m.level))}`"
                :prevent-mouse-down="true"
                @click="toggleHeadingMenu(m.level)"
              />
              <BasePopover
                :open="openHeadingMenu === m.level"
                class="style-popover"
                :aria-label="`${m.short}スタイル`"
              >
                <div class="style-option-list">
                  <button
                    v-for="opt in headingStyleOptions"
                    :key="`${m.level}-${opt.value}`"
                    type="button"
                    class="style-option"
                    :class="{ active: opt.value === getHeadingStyle(m.level) }"
                    @mouseenter="hoverHeadingStyle = opt.value"
                    @focus="hoverHeadingStyle = opt.value"
                    @click="setHeadingStyle(m.level, opt.value)"
                  >
                    {{ opt.label }}
                  </button>
                </div>
                <div>
                  <div class="heading-config" :aria-label="`${m.short}見出し設定`">
                    <div class="heading-config-row" style="display: flex; align-items:end">
                      <label class="heading-config-item">
                        <span class="heading-config-label">スタイル色</span>
                        <div style="display:flex;gap:6px;align-items:center;">
                          <input type="color" :value="getHeadingAccent(m.level)" @input="onHeadingAccentPickerInput(m.level, $event)">
                        </div>
                      </label>
                      <label class="heading-config-item">
                        <span class="heading-config-label">背景色</span>
                        <input type="color" :value="getHeadingBg(m.level)" @input="onHeadingBgPickerInput(m.level, $event)">
                      </label>
                      <label class="heading-config-item">
                        <span class="heading-config-label">文字色</span>
                        <input type="color" :value="getHeadingText(m.level)" @input="onHeadingTextPickerInput(m.level, $event)">
                      </label>
                      <div class="heading-config-row" style="display: flex; justify-content: flex-end; width: 100%; ">
                        <button type="button" class="color-add-button" style="height:28px;" @click="setHeadingAccentToTheme(m.level)">テーマに合わせる</button>
                      </div>
                      <div class="heading-config-item">
                        <span class="heading-config-label">文字サイズ</span>
                        <div style="display: flex; gap: 4px; align-items: center;">
                          <BaseSelect
                            :model-value="String(getHeadingSize(m.level))"
                            class="toolbar-select"
                            style="width: 80px;"
                            aria-label="文字サイズ"
                            @change="onHeadingSizeSelectChange(m.level, $event)"
                          >
                            <BaseOption value="8">8px</BaseOption>
                            <BaseOption value="9">9px</BaseOption>
                            <BaseOption value="10">10px</BaseOption>
                            <BaseOption value="11">11px</BaseOption>
                            <BaseOption value="12">12px</BaseOption>
                            <BaseOption value="14">14px</BaseOption>
                            <BaseOption value="16">16px</BaseOption>
                            <BaseOption value="18">18px</BaseOption>
                            <BaseOption value="20">20px</BaseOption>
                            <BaseOption value="22">22px</BaseOption>
                            <BaseOption value="24">24px</BaseOption>
                            <BaseOption value="26">26px</BaseOption>
                            <BaseOption value="28">28px</BaseOption>
                            <BaseOption value="36">36px</BaseOption>
                            <BaseOption value="48">48px</BaseOption>
                            <BaseOption value="72">72px</BaseOption>
                          </BaseSelect>
                          <button type="button" class="toolbar-nudge" @click="decreaseHeadingSize(m.level)">
                            <span class="short">A-</span>
                          </button>
                          <button type="button" class="toolbar-nudge" @click="increaseHeadingSize(m.level)">
                            <span class="short">A+</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div class="heading-config-row">
                      <label class="heading-config-item heading-config-item-wide">
                        <span class="heading-config-label">フォント</span>
                        <BaseSelect
                          :model-value="getHeadingFont(m.level)"
                          class="toolbar-select"
                          @change="onHeadingFontSelectChange(m.level, $event)"
                        >
                          <BaseOption
                            v-for="opt in headingFontOptions"
                            :key="`${m.level}-${opt.value}`"
                            :value="opt.value"
                          >
                            {{ opt.label }}
                          </BaseOption>
                        </BaseSelect>
                      </label>
                    </div>
                  </div>
                  <div
                    class="doc-frame heading-sample"
                    data-doc-font="system"
                    :data-heading-h1="sampleHeadingStyle('h1', m.level)"
                    :data-heading-h2="sampleHeadingStyle('h2', m.level)"
                    :data-heading-h3="sampleHeadingStyle('h3', m.level)"
                    :style="{ ...docHeadingVars, ...getHeadingSampleSizeStyle(m.level) }"
                  >
                    <component :is="m.level">{{ m.sampleText }}</component>
                    <p>本文テキストです。</p>
                  </div>
                </div>
              </BasePopover>
            </div>
            <div ref="textStyleMenuRef" class="toolbar-style-menu">
              <ToolButton
                short="TS"
                label="テキストスタイル"
                :prevent-mouse-down="true"
                @click="toggleTextStylePopover"
              />
              <BasePopover
                :open="isTextStylePopoverOpen"
                class="style-popover"
                aria-label="テキストスタイル"
              >
                <div class="style-option-list" @mouseleave="hoverTextStyle = null">
                  <button
                    v-for="opt in headingStyleOptions"
                    :key="`text-${opt.value}`"
                    type="button"
                    class="style-option"
                    :class="{ active: opt.value === textStyleChoice }"
                    @mouseenter="hoverTextStyle = opt.value"
                    @focus="hoverTextStyle = opt.value"
                    @blur="hoverTextStyle = null"
                    @click="onTextStyleClick(opt.value)"
                  >
                    {{ opt.label }}
                  </button>
                </div>
                <div>
                  <div class="heading-config" aria-label="テキストスタイル設定">
                    <div class="heading-config-row" style="display: flex; align-items:end">
                      <label class="heading-config-item">
                        <span class="heading-config-label">スタイル色</span>
                        <div style="display:flex;gap:6px;align-items:center;">
                          <input type="color" :value="textStyleAccent" @input="onTextStyleAccentPickerInput">
                        </div>
                      </label>
                      <label class="heading-config-item">
                        <span class="heading-config-label">背景色</span>
                        <input type="color" :value="textStyleBg" @input="onTextStyleBgPickerInput">
                      </label>
                      <label class="heading-config-item">
                        <span class="heading-config-label">文字色</span>
                        <input type="color" :value="textStyleText" @input="onTextStyleTextPickerInput">
                      </label>
                      <div class="heading-config-row" style="display: flex; justify-content: flex-end; width: 100%; ">
                        <button type="button" class="color-add-button" style="height:28px;" @click="setTextStyleToTheme">テーマに合わせる</button>
                      </div>
                      <div class="heading-config-item">
                        <span class="heading-config-label">文字サイズ</span>
                        <div style="display: flex; gap: 4px; align-items: center;">
                          <BaseSelect
                            :model-value="String(textStyleSize)"
                            class="toolbar-select"
                            style="width: 80px;"
                            aria-label="文字サイズ"
                            @change="onTextStyleSizeSelectChange"
                          >
                            <BaseOption value="8">8px</BaseOption>
                            <BaseOption value="9">9px</BaseOption>
                            <BaseOption value="10">10px</BaseOption>
                            <BaseOption value="11">11px</BaseOption>
                            <BaseOption value="12">12px</BaseOption>
                            <BaseOption value="14">14px</BaseOption>
                            <BaseOption value="16">16px</BaseOption>
                            <BaseOption value="18">18px</BaseOption>
                            <BaseOption value="20">20px</BaseOption>
                            <BaseOption value="22">22px</BaseOption>
                            <BaseOption value="24">24px</BaseOption>
                            <BaseOption value="26">26px</BaseOption>
                            <BaseOption value="28">28px</BaseOption>
                            <BaseOption value="36">36px</BaseOption>
                            <BaseOption value="48">48px</BaseOption>
                            <BaseOption value="72">72px</BaseOption>
                          </BaseSelect>
                          <button type="button" class="toolbar-nudge" @click="decreaseTextStyleSize">
                            <span class="short">A-</span>
                          </button>
                          <button type="button" class="toolbar-nudge" @click="increaseTextStyleSize">
                            <span class="short">A+</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div class="heading-config-row">
                      <label class="heading-config-item heading-config-item-wide">
                        <span class="heading-config-label">フォント</span>
                        <BaseSelect
                          :model-value="textStyleFont"
                          class="toolbar-select"
                          @change="onTextStyleFontSelectChange"
                        >
                          <BaseOption
                            v-for="opt in headingFontOptions"
                            :key="`text-${opt.value}`"
                            :value="opt.value"
                          >
                            {{ opt.label }}
                          </BaseOption>
                        </BaseSelect>
                      </label>
                    </div>
                  </div>
                  <div
                    class="doc-frame heading-sample"
                    data-doc-font="system"
                    :data-heading-h3="hoverTextStyle || textStyleChoice"
                    :style="{ ...docHeadingVars, '--h3-size': `${textStyleSize}px`, '--h3-accent': textStyleAccent, '--h3-text': textStyleText, '--h3-bg': textStyleBg, '--h3-font': getHeadingFontFamily(textStyleFont) }"
                  >
                    <p>本文テキストです。</p>
                    <h3>テキストスタイルサンプル</h3>
                  </div>
                </div>
                <!-- 『適用』『閉じる』ボタンは不要。クリックで即適用する仕様に変更しました -->
              </BasePopover>
            </div>

            <span class="toolbar-divider" aria-hidden="true" />

            <ToolButton
              short="I"
              label="画像"
              :prevent-mouse-down="true"
              @mousedown="captureSelection"
              @click="openImagePicker"
            />

            <div ref="imageWidthMenuRef" class="toolbar-color-menu">
              <ToolButton
                short="↔"
                label="幅%"
                :disabled="!selectedImageBlock"
                :prevent-mouse-down="true"
                @click="toggleImageWidthPopover"
              />
              <BasePopover
                :open="isImageWidthPopoverOpen"
                class="color-popover"
                aria-label="画像幅"
              >
                <div class="color-popover-section">
                  <div class="color-popover-title">画像の幅</div>
                  <div class="color-popover-subtitle">選択中の画像に適用します</div>

                  <div class="link-popover-grid">
                    <label class="link-popover-field">
                      <span class="link-popover-label">幅 (%)</span>
                      <div style="display:flex;gap:8px;align-items:center;">
                        <input
                          type="range"
                          min="5"
                          max="100"
                          step="1"
                          v-model.number="imageWidthPercent"
                          style="flex:1;min-width:0;"
                        >
                        <input
                          type="number"
                          min="5"
                          max="100"
                          step="1"
                          v-model.number="imageWidthPercent"
                          class="link-input link-input-mono"
                          style="width:96px;"
                        >
                      </div>
                    </label>
                  </div>

                  <div class="link-popover-actions">
                    <button type="button" class="color-add-button" :disabled="!selectedImageBlock" @click="applyImageWidthToSelected">適用</button>
                    <button type="button" class="color-add-button" @click="isImageWidthPopoverOpen = false">閉じる</button>
                  </div>
                </div>
              </BasePopover>
            </div>

            <ToolSelect
              v-model="imageLayoutSelect"
              class="toolbar-select"
              label="配置"
              aria-label="画像の配置"
              :disabled="!selectedImageBlock"
              @mousedown="captureSelection"
              @focus="captureSelection"
              @change="onImageLayoutChange"
            >
              <BaseOption value="inline">通常</BaseOption>
              <BaseOption value="left">左寄せ</BaseOption>
              <BaseOption value="center">中央</BaseOption>
              <BaseOption value="right">右寄せ</BaseOption>
              <BaseOption value="float-left">回り込み：左</BaseOption>
              <BaseOption value="float-right">回り込み：右</BaseOption>
            </ToolSelect>

            <ToolButton
              short="🗑"
              label="画像削除"
              :disabled="!selectedImageBlock"
              :prevent-mouse-down="true"
              @click="deleteSelectedImage"
            />

            <input
              ref="imageInputRef"
              type="file"
              accept="image/*"
              style="display:none"
              @change="onImageInputChange"
            >

        </div>
        <div class="toolbar-items">
            <ToolButton short="H1" label="大見出し" :prevent-mouse-down="true" @click="insertTemplate('h1')" />
            <ToolButton short="H2" label="中見出し" :prevent-mouse-down="true" @click="insertTemplate('h2')" />
            <ToolButton short="H3" label="小見出し" :prevent-mouse-down="true" @click="insertTemplate('h3')" />
            <div ref="accordionMenuRef" class="toolbar-color-menu">
              <ToolButton short="▼" label="アコーディオン" :prevent-mouse-down="true" @click="toggleAccordionPopover" />
              <BasePopover
                :open="isAccordionPopoverOpen"
                class="color-popover"
                aria-label="アコーディオン"
              >
                <div class="color-popover-section">
                  <div class="color-popover-title">アコーディオン</div>
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                    <div class="color-popover-subtitle" style="margin: 0; flex: 1;">アコーディオンを追加<br>または選択範囲をアコーディオンに変換します。</div>
                    <button type="button" class="color-add-button" @click="insertTemplate('accordion')">{{ hasTextSelection ? '変換' : '追加' }}</button>
                  </div>
                </div>

                <div class="color-popover-section">
                  <div class="color-popover-title">スタイル</div>
                  <div class="color-popover-subtitle">アコーディオンごとに見た目を変更できます</div>

                  <div class="link-popover-grid">
                    <label class="link-popover-field">
                      <span class="link-popover-label">選択中のアコーディオン</span>
                      <BaseSelect
                        v-model="accordionStyleForSelection"
                        class="toolbar-select"
                        :disabled="!hasAccordionInSelection"
                        aria-label="選択中アコーディオンのスタイル"
                      >
                        <BaseOption value="simple">シンプル（アイコンのみ）</BaseOption>
                        <BaseOption value="boxed">ボックス</BaseOption>
                      </BaseSelect>
                      <div class="link-popover-actions" style="justify-content:flex-start;gap:8px;padding:8px 0 0;">
                        <button type="button" class="color-add-button" :disabled="!hasAccordionInSelection" @click="applyAccordionStyleToSelection">適用</button>
                      </div>
                    </label>

                    <label class="link-popover-field">
                      <span class="link-popover-label">新規作成時のデフォルト</span>
                      <BaseSelect
                        v-model="accordionDefaultStyle"
                        class="toolbar-select"
                        aria-label="新規アコーディオンのデフォルトスタイル"
                        @change="persistDocStyle"
                      >
                        <BaseOption value="simple">シンプル（アイコンのみ）</BaseOption>
                        <BaseOption value="boxed">ボックス</BaseOption>
                      </BaseSelect>
                    </label>
                  </div>
                </div>
              </BasePopover>
            </div>
            <div ref="dividerMenuRef" class="toolbar-color-menu">
              <ToolButton short="—" label="区切り線" :prevent-mouse-down="true" @click="toggleDividerPopover" />
              <BasePopover
                :open="isDividerPopoverOpen"
                class="color-popover"
                aria-label="区切り線"
              >
                <div class="color-popover-section">
                  <div class="color-popover-title">区切り線</div>
                  <div class="color-popover-subtitle">挿入する区切り線の色を選択します</div>
                  <div style="display:flex;align-items:center;gap:8px;">
                    <input type="color" class="color-picker" v-model="dividerColor">
                    <button type="button" class="color-add-button" style="height:32px;" @click="setDividerColorFromTextColor">文字色から反映</button>
                  </div>
                  <div style="display:flex;gap:8px;justify-content:flex-end;padding-top:8px;">
                    <button type="button" class="color-add-button" @click="insertDivider">挿入</button>
                    <button type="button" class="color-add-button" @click="isDividerPopoverOpen = false">閉じる</button>
                  </div>
                </div>
              </BasePopover>
            </div>

            <span class="toolbar-divider" aria-hidden="true" />

            <ToolButton short="←" label="ひとつ戻す" @click="undo" />
            <ToolButton short="→" label="ひとつ進む" :disabled="historyIndex >= history.length - 1" @click="redo" />
        </div>
      </div>
    </div>

    <div class="editor-body">
      <div
        ref="editorRef"
        class="editor-surface doc-frame"
        contenteditable="true"
        data-placeholder="ここに入力してください…"
        data-doc-font="system"
        :data-heading-h1="headingStyleH1"
        :data-heading-h2="headingStyleH2"
        :data-heading-h3="headingStyleH3"
        :style="docHeadingVars"
        @keyup="captureSelection"
        @mouseup="onEditorMouseup"
        @click="onEditorClick"
        @contextmenu.prevent="onEditorContextMenu"
        @mousedown="onEditorMousedown"
        @keydown="onKeydown"
        @compositionstart="onCompositionStart"
        @compositionend="onCompositionEnd"
        @paste="onPaste"
        @dragover.prevent
        @drop="onDrop"
        @input="onInput"
      />

      <div
        v-if="isLinkChipVisible"
        class="link-chip"
        :style="linkChipStyle"
        @mousedown.prevent
      >
        <span class="link-chip-label">URL</span>
        <span class="link-chip-url">{{ linkChipUrl }}</span>
      </div>

      <button
        v-if="copyPopoverVisible"
        ref="copyPopoverRef"
        type="button"
        class="copy-popover"
        :style="copyPopoverStyle"
        @mousedown.stop
        @click.stop="onCopyPopoverClick"
      >
        コピー
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
/* eslint-disable no-unused-vars, new-cap */
/* global defineProps, defineEmits, defineExpose */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Character, TocItem } from '../types/models'
import { buildExportHtmlDocument } from '../utils/exportHtml'
import { buildJsonExportFromRenderedHtml } from '../utils/exportJson'
import { downloadText, sanitizeFileBaseName } from '../utils/download'
import ColorSection from './ui/ColorSection.vue'
import BasePopover from './ui/BasePopover.vue'
import BaseSelect from './ui/BaseSelect.vue'
import BaseOption from './ui/BaseOption.vue'
import ToolButton from './toolbar/ToolButton.vue'
import ToolSelect from './toolBar/ToolSelect.vue'
import { normalizeHexColor } from '../utils/color'
import { useRecentColorStorage } from '../composables/useRecentColorStorage'
import { normalizeAccordionStyle } from '../utils/accordionStyle'
import { useOutsideClose } from '../composables/useOutsideClose'

declare global {
  interface Window {
    jspdf?: any
    html2canvas?: any
  }
}

const props = defineProps({
  content: { type: String, default: '' },
  renderedHtml: { type: String, default: '' },
  characters: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:content', 'toc-change', 'update:doc-bg'])

const editorRef = ref<HTMLDivElement | null>(null)
const savedRange = ref<Range | null>(null)

const isComposing = ref(false)
let pendingAfterCompositionEnd = false

const imageInputRef = ref<HTMLInputElement | null>(null)
const selectedImageBlock = ref<HTMLElement | null>(null)
const copyPopoverVisible = ref(false)
const copyPopoverRef = ref<HTMLElement | null>(null)
const copyPopoverX = ref(0)
const copyPopoverY = ref(0)
const copyTargetEl = ref<HTMLElement | null>(null)
const copyPopoverStyle = computed(() => ({
  left: `${copyPopoverX.value}px`,
  top: `${copyPopoverY.value}px`
}))

const imageWidthMenuRef = ref<HTMLElement | null>(null)
const isImageWidthPopoverOpen = ref(false)
const imageWidthPercent = ref(100)
const lastMouseDownPos = ref<{ x: number; y: number } | null>(null)
const skipClearSelectionOnce = ref(false)

type ImageLayout = 'inline' | 'left' | 'center' | 'right' | 'float-left' | 'float-right'
const imageLayoutSelect = ref<ImageLayout>('inline')

const history = ref<string[]>([])
const historyIndex = ref(-1)
const isApplyingHistory = ref(false)
const lastSyncedFromSelf = ref<string | null>(null)

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'
const { registerOutsideClose } = useOutsideClose()

// ---- document style (font / headings)
type DocFont = 'system' | 'gothic' | 'mincho' | 'serif' | 'mono'
type HeadingStyle = 'underline-solid' | 'underline-dotted' | 'underline-double' | 'underline-dashed' | 'box-solid' | 'box-dotted' | 'box-dashed' | 'box-double' | 'topbottom-solid' | 'topbottom-dotted' | 'topbottom-dashed' | 'topbottom-double' | 'underline-stripe' | 'box-stripe' | 'leftbar' | 'bracket' | 'line-accent' | 'side-lines' | 'simple' | 'corner-triangle' | 'bg-box'
type AccordionStyle = 'simple' | 'boxed'
const DOC_STYLE_STORAGE_KEY = 'htmlmaker:docStyle'

const DEFAULT_THEME_ACCENT = '#dadadd'
const DEFAULT_H1_ACCENT = '#dadadd'
const DEFAULT_H2_ACCENT = '#dadadd'
const DEFAULT_H3_ACCENT = '#9ca3af'
const DEFAULT_DOC_BG = '#ffffff'
const DEFAULT_TEXT_COLOR = '#111827'

const themeMenuRef = ref<HTMLElement | null>(null)
const isThemePopoverOpen = ref(false)
const themeAccent = ref(DEFAULT_THEME_ACCENT)
// ポップオーバー内の入力は「適用」まで反映しない（ドラフト）
const themeAccentDraft = ref(DEFAULT_THEME_ACCENT)
const themeAccentCodeDraft = ref(DEFAULT_THEME_ACCENT)

const docBg = ref(DEFAULT_DOC_BG)
const docBgCode = ref(DEFAULT_DOC_BG)

const docTextColor = ref(DEFAULT_TEXT_COLOR)
const docTextColorCode = ref(DEFAULT_TEXT_COLOR)

const accordionMenuRef = ref<HTMLElement | null>(null)
const isAccordionPopoverOpen = ref(false)
const accordionDefaultStyle = ref<AccordionStyle>('boxed')
const accordionStyleForSelection = ref<AccordionStyle>('boxed')

const headingAccentCustomH1 = ref(false)
const headingAccentCustomH2 = ref(false)
const headingAccentCustomH3 = ref(false)

const getAccordionInSelection = (): HTMLDetailsElement | null => {
  const el = editorRef.value
  if (!el) return null

  const sel = window.getSelection()
  const node = savedRange.value?.startContainer || sel?.anchorNode
  if (!node) return null
  const host = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : (node.parentElement as Element | null)
  const details = host?.closest?.('details.accordion') as HTMLDetailsElement | null
  if (!details) return null
  if (!el.contains(details)) return null
  return details
}

const hasAccordionInSelection = computed(() => !!getAccordionInSelection())

const hasTextSelection = computed(() => {
  const range = savedRange.value
  if (!range) return false
  return !range.collapsed
})

const refreshAccordionPopoverState = () => {
  const details = getAccordionInSelection()
  const current = normalizeAccordionStyle(details?.getAttribute('data-accordion-style'))
  accordionStyleForSelection.value = current ?? accordionDefaultStyle.value
}

const toggleAccordionPopover = () => {
  const next = !isAccordionPopoverOpen.value
  isAccordionPopoverOpen.value = next
  if (next) refreshAccordionPopoverState()
}

const applyAccordionStyleToSelection = () => {
  const details = getAccordionInSelection()
  if (!details) return
  const style = accordionStyleForSelection.value
  try {
    details.setAttribute('data-accordion-style', style)
  } catch {}
  runAfterDomMutation()
}

const ensureAccordionStyleAttributes = (root: HTMLElement) => {
  const style = accordionDefaultStyle.value
  try {
    const list = Array.from(root.querySelectorAll('details.accordion')) as HTMLDetailsElement[]
    list.forEach((d) => {
      const current = normalizeAccordionStyle(d.getAttribute('data-accordion-style'))
      if (current) return
      try {
        d.setAttribute('data-accordion-style', style)
      } catch {}
    })
  } catch {}
}

// フォント選択は「選択範囲/キャレット位置へ適用」するツール（文書全体は変更しない）
const docFontSelect = ref<DocFont>('system')
const baseDocFont: DocFont = 'system'
const headingStyleH1 = ref<HeadingStyle>('underline-solid')
const headingStyleH2 = ref<HeadingStyle>('underline-solid')
const headingStyleH3 = ref<HeadingStyle>('underline-solid')

type HeadingFont = 'inherit' | DocFont

const headingFontH1 = ref<HeadingFont>('inherit')
const headingFontH2 = ref<HeadingFont>('inherit')
const headingFontH3 = ref<HeadingFont>('inherit')

const headingAccentH1 = ref(DEFAULT_H1_ACCENT)
const headingAccentH2 = ref(DEFAULT_H2_ACCENT)
const headingAccentH3 = ref('#9ca3af')

const headingTextH1 = ref('#111827')
const headingTextH2 = ref('#111827')
const headingTextH3 = ref('#374151')

const headingBgH1 = ref('#eef2ff')
const headingBgH2 = ref('#f3f4f6')
const headingBgH3 = ref('#ffffff')

const headingSizeH1 = ref(24)
const headingSizeH2 = ref(20)
const headingSizeH3 = ref(16)

const textStyleAccent = ref('#9ca3af')
const textStyleText = ref('#374151')
const textStyleBg = ref('#ffffff')
const textStyleSize = ref(16)
const textStyleFont = ref<HeadingFont>('inherit')
const columnsMenuRef = ref<HTMLElement | null>(null)
const isColumnsPopoverOpen = ref(false)
const twoColumnWidthPercent = ref(100)

const twoColDividerEnabled = ref(false)
const twoColDividerColor = ref('#e5e7eb')

const headingStyleOptions: Array<{ value: HeadingStyle; label: string }> = [
  { value: 'simple', label: 'シンプル' },
  { value: 'underline-solid', label: '下線（実線）' },
  { value: 'underline-dotted', label: '下線（点線）' },
  { value: 'underline-dashed', label: '下線（破線）' },
  { value: 'underline-double', label: '下線（二重線）' },
  { value: 'underline-stripe', label: '下線（斜線）' },
  { value: 'leftbar', label: '左線' },
  { value: 'line-accent', label: 'ライン装飾' },
  { value: 'side-lines', label: '左右線' },
  { value: 'topbottom-solid', label: '上下線（実線）' },
  { value: 'topbottom-dotted', label: '上下線（点線）' },
  { value: 'topbottom-dashed', label: '上下線（破線）' },
  { value: 'topbottom-double', label: '上下線（二重線）' },
  { value: 'bracket', label: '括弧' },
  { value: 'box-solid', label: 'ボックス（実線）' },
  { value: 'box-dotted', label: 'ボックス（点線）' },
  { value: 'box-dashed', label: 'ボックス（破線）' },
  { value: 'box-double', label: 'ボックス（二重線）' },
  { value: 'box-stripe', label: 'ボックス下部（斜線）' },
  { value: 'corner-triangle', label: '角三角' },
  { value: 'bg-box', label: '背景ボックス' }
]

const headingStyleLabel = (v: HeadingStyle) => {
  const found = headingStyleOptions.find((o) => o.value === v)
  return found ? found.label : String(v)
}

type HeadingLevel = 'h1' | 'h2' | 'h3'
const openHeadingMenu = ref<HeadingLevel | null>(null)
const hoverHeadingStyle = ref<HeadingStyle>('underline-solid')

const headingMenus = [
  { level: 'h1', short: 'H1', sampleText: '大見出しサンプル' },
  { level: 'h2', short: 'H2', sampleText: '中見出しサンプル' },
  { level: 'h3', short: 'H3', sampleText: '小見出しサンプル' }
] as const

const headingMenuEls = {
  h1: ref<HTMLElement | null>(null),
  h2: ref<HTMLElement | null>(null),
  h3: ref<HTMLElement | null>(null)
}

const setHeadingMenuEl = (level: HeadingLevel, el: any) => {
  headingMenuEls[level].value = (el as HTMLElement | null) || null
}

const getHeadingStyle = (level: HeadingLevel) => {
  if (level === 'h1') return headingStyleH1.value
  if (level === 'h2') return headingStyleH2.value
  return headingStyleH3.value
}

const getHeadingAccent = (level: HeadingLevel) => {
  if (level === 'h1') return headingAccentH1.value
  if (level === 'h2') return headingAccentH2.value
  return headingAccentH3.value
}

const getHeadingText = (level: HeadingLevel) => {
  if (level === 'h1') return headingTextH1.value
  if (level === 'h2') return headingTextH2.value
  return headingTextH3.value
}

const getHeadingBg = (level: HeadingLevel) => {
  if (level === 'h1') return headingBgH1.value
  if (level === 'h2') return headingBgH2.value
  return headingBgH3.value
}

const getHeadingFont = (level: HeadingLevel) => {
  if (level === 'h1') return headingFontH1.value
  if (level === 'h2') return headingFontH2.value
  return headingFontH3.value
}

const getHeadingSize = (level: HeadingLevel) => {
  if (level === 'h1') return headingSizeH1.value
  if (level === 'h2') return headingSizeH2.value
  return headingSizeH3.value
}

const getHeadingSampleSizeStyle = (level: HeadingLevel) => {
  const size = getHeadingSize(level)
  if (level === 'h1') return { '--h1-size': `${size}px` }
  if (level === 'h2') return { '--h2-size': `${size}px` }
  return { '--h3-size': `${size}px` }
}

// --- テキストスタイル
const textStyleMenuRef = ref<HTMLElement | null>(null)
const isTextStylePopoverOpen = ref(false)
const textStyleChoice = ref<HeadingStyle>('underline-solid')
const hoverTextStyle = ref<HeadingStyle | null>(null)
const toggleTextStylePopover = () => {
  isTextStylePopoverOpen.value = !isTextStylePopoverOpen.value
}

const onTextStyleClick = (value: HeadingStyle) => {
  textStyleChoice.value = value
  // 選択範囲に即適用（applyボタンと同じ動作）
  applyTextStyleToSelection()
}

const applyTextStyleToSelection = () => {
  try {
    const sel = window.getSelection()
    if (!sel) {
      return
    }
    const range = sel.rangeCount > 0 ? sel.getRangeAt(0) : null
    if (!range) {
      return
    }
    const hasSelection = !range.collapsed

    const span = document.createElement('span')
    span.style.color = textStyleText.value
    span.style.backgroundColor = textStyleBg.value
    span.style.fontSize = `${textStyleSize.value}px`
    const fontFamily = getHeadingFontFamily(textStyleFont.value)
    if (textStyleFont.value !== 'inherit') {
      span.style.fontFamily = fontFamily
    } else {
      span.style.fontFamily = ''
    }
    // data-text-style属性を付与
    span.setAttribute('data-text-style', textStyleChoice.value)

    if (hasSelection) {
      // 選択範囲がある場合、内容を抽出しspanでラップ
      const fragment = range.extractContents()
      span.appendChild(fragment)
      range.insertNode(span)
      sel.removeAllRanges()
      const r2 = document.createRange()
      r2.setStartAfter(span)
      r2.collapse(true)
      sel.addRange(r2)
    } else {
      // 選択範囲がない場合、spanを挿入してカーソルを中に置く
      span.innerHTML = '&#8203;' // zero-width space
      range.insertNode(span)
      sel.removeAllRanges()
      const r2 = document.createRange()
      r2.setStart(span, 0)
      r2.setEnd(span, 1)
      sel.addRange(r2)
    }
    isTextStylePopoverOpen.value = false
    runAfterDomMutation()
  } catch (e) {
  }
}

// --- 区切り線挿入
const dividerMenuRef = ref<HTMLElement | null>(null)
const isDividerPopoverOpen = ref(false)
const dividerColor = ref('#e5e7eb')
const toggleDividerPopover = () => {
  isDividerPopoverOpen.value = !isDividerPopoverOpen.value
}

const insertDivider = () => {
  try {
    const hr = document.createElement('hr')
    hr.style.border = 'none'
    hr.style.borderTop = `1px solid ${String(dividerColor.value || '#e5e7eb')}`
    hr.style.margin = '12px 0'
    const sel = window.getSelection()
    if (sel && sel.rangeCount) {
      const range = sel.getRangeAt(0)
      // collapse して挿入
      range.collapse(true)
      range.insertNode(hr)
      sel.removeAllRanges()
      const r2 = document.createRange()
      r2.setStartAfter(hr)
      r2.collapse(true)
      sel.addRange(r2)
    } else if (editorRef && editorRef.value) {
      editorRef.value.appendChild(hr)
    }
    isDividerPopoverOpen.value = false
    runAfterDomMutation()
  } catch (e) {}
}

const setDividerColorFromTextColor = () => {
  const textColor = docTextColor.value
  // ドキュメントの文字色を正規化した16進カラーで設定（color input に適合）
  const hex = normalizeHexColor(textColor)
  if (hex) {
    dividerColor.value = hex
  }
}

const onHeadingAccentPickerInput = (level: HeadingLevel, ev: Event) => {
  const v = (ev.target as HTMLInputElement | null)?.value || ''
  if (level === 'h1') headingAccentH1.value = v
  else if (level === 'h2') headingAccentH2.value = v
  else headingAccentH3.value = v
  onHeadingAccentInput(level)
}

const onHeadingTextPickerInput = (level: HeadingLevel, ev: Event) => {
  const v = (ev.target as HTMLInputElement | null)?.value || ''
  if (level === 'h1') headingTextH1.value = v
  else if (level === 'h2') headingTextH2.value = v
  else headingTextH3.value = v
  persistDocStyle()
}

const onHeadingBgPickerInput = (level: HeadingLevel, ev: Event) => {
  const v = (ev.target as HTMLInputElement | null)?.value || ''
  if (level === 'h1') headingBgH1.value = v
  else if (level === 'h2') headingBgH2.value = v
  else headingBgH3.value = v
  persistDocStyle()
}

const onHeadingSizeInput = (level: HeadingLevel, ev: Event) => {
  const v = Number((ev.target as HTMLInputElement | null)?.value || 0)
  if (!Number.isFinite(v) || v < 8 || v > 72) return
  if (level === 'h1') headingSizeH1.value = v
  else if (level === 'h2') headingSizeH2.value = v
  else headingSizeH3.value = v
  persistDocStyle()
}

const onHeadingSizeSelectChange = (level: HeadingLevel, ev: Event) => {
  const v = Number((ev.target as HTMLSelectElement | null)?.value || 0)
  if (Number.isFinite(v) && v >= 8 && v <= 72) {
    if (level === 'h1') headingSizeH1.value = v
    else if (level === 'h2') headingSizeH2.value = v
    else headingSizeH3.value = v
    persistDocStyle()
  }
}

const sizeOptions = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72]

const decreaseHeadingSize = (level: HeadingLevel) => {
  const current = getHeadingSize(level)
  const currentIndex = sizeOptions.indexOf(current)
  if (currentIndex > 0) {
    const newSize = sizeOptions[currentIndex - 1]
    if (level === 'h1') headingSizeH1.value = newSize
    else if (level === 'h2') headingSizeH2.value = newSize
    else headingSizeH3.value = newSize
    persistDocStyle()
  }
}

const increaseHeadingSize = (level: HeadingLevel) => {
  const current = getHeadingSize(level)
  const currentIndex = sizeOptions.indexOf(current)
  if (currentIndex >= 0 && currentIndex < sizeOptions.length - 1) {
    const newSize = sizeOptions[currentIndex + 1]
    if (level === 'h1') headingSizeH1.value = newSize
    else if (level === 'h2') headingSizeH2.value = newSize
    else headingSizeH3.value = newSize
    persistDocStyle()
  }
}

const onHeadingFontSelectChange = (level: HeadingLevel, ev: Event) => {
  const v = (ev.target as HTMLSelectElement | null)?.value || 'inherit'
  if (level === 'h1') headingFontH1.value = v as any
  else if (level === 'h2') headingFontH2.value = v as any
  else headingFontH3.value = v as any
  persistDocStyle()
}

const sampleHeadingStyle = (sampleLevel: HeadingLevel, menuLevel: HeadingLevel) => {
  if (sampleLevel === menuLevel) return hoverHeadingStyle.value || getHeadingStyle(sampleLevel)
  return getHeadingStyle(sampleLevel)
}

// --- テキストスタイル設定関数
const onTextStyleAccentPickerInput = (ev: Event) => {
  textStyleAccent.value = (ev.target as HTMLInputElement | null)?.value || '#9ca3af'
}

const onTextStyleTextPickerInput = (ev: Event) => {
  textStyleText.value = (ev.target as HTMLInputElement | null)?.value || '#374151'
}

const onTextStyleBgPickerInput = (ev: Event) => {
  textStyleBg.value = (ev.target as HTMLInputElement | null)?.value || '#ffffff'
}

const onTextStyleSizeSelectChange = (ev: Event) => {
  const v = Number((ev.target as HTMLSelectElement | null)?.value || 0)
  if (Number.isFinite(v) && v >= 8 && v <= 72) {
    textStyleSize.value = v
  }
}

const decreaseTextStyleSize = () => {
  const current = textStyleSize.value
  const currentIndex = sizeOptions.indexOf(current)
  if (currentIndex > 0) {
    textStyleSize.value = sizeOptions[currentIndex - 1]
  }
}

const increaseTextStyleSize = () => {
  const current = textStyleSize.value
  const currentIndex = sizeOptions.indexOf(current)
  if (currentIndex >= 0 && currentIndex < sizeOptions.length - 1) {
    textStyleSize.value = sizeOptions[currentIndex + 1]
  }
}

const onTextStyleFontSelectChange = (ev: Event) => {
  const v = (ev.target as HTMLSelectElement | null)?.value || ''
  if (v === 'inherit' || v === 'system' || v === 'gothic' || v === 'mincho' || v === 'serif' || v === 'mono') {
    textStyleFont.value = v as HeadingFont
  }
}

const setTextStyleToTheme = () => {
  textStyleAccent.value = themeAccent.value
  textStyleBg.value = docBg.value
  textStyleText.value = docTextColor.value
}

const toggleHeadingMenu = (level: HeadingLevel) => {
  if (openHeadingMenu.value === level) {
    openHeadingMenu.value = null
    return
  }
  openHeadingMenu.value = level
  hoverHeadingStyle.value = getHeadingStyle(level)
}

const setHeadingStyle = (level: HeadingLevel, style: HeadingStyle) => {
  if (level === 'h1') headingStyleH1.value = style
  else if (level === 'h2') headingStyleH2.value = style
  else headingStyleH3.value = style
  persistDocStyle()
  openHeadingMenu.value = null
}

const setThemeCssVar = (color: string) => {
  if (!isBrowser) return
  try {
    document.documentElement.style.setProperty('--theme-accent', color)

    const parsed = normalizeHexColor(String(color || '').trim())
    if (parsed && /^#([0-9a-f]{6})$/i.test(parsed)) {
      const hex = parsed.slice(1)
      const r = Number.parseInt(hex.slice(0, 2), 16)
      const g = Number.parseInt(hex.slice(2, 4), 16)
      const b = Number.parseInt(hex.slice(4, 6), 16)
      if ([r, g, b].every((n) => Number.isFinite(n))) {
        document.documentElement.style.setProperty('--theme-accent-rgb', `${r}, ${g}, ${b}`)
      }
    }
  } catch {}
}

const applyThemeAccent = (raw: string, opts?: { skipPersist?: boolean }) => {
  const parsed = normalizeHexColor(String(raw || '').trim())
  if (!parsed) return

  const prev = themeAccent.value
  themeAccent.value = parsed
  themeAccentDraft.value = parsed
  themeAccentCodeDraft.value = parsed
  setThemeCssVar(parsed)

  if (!headingAccentCustomH1.value || headingAccentH1.value === prev) {
    headingAccentH1.value = parsed
    headingAccentCustomH1.value = false
  }
  if (!headingAccentCustomH2.value || headingAccentH2.value === prev) {
    headingAccentH2.value = parsed
    headingAccentCustomH2.value = false
  }
  if (!headingAccentCustomH3.value || headingAccentH3.value === prev) {
    headingAccentH3.value = parsed
    headingAccentCustomH3.value = false
  }

  // 既存の char-token に「古い色」が残っている場合があるため、テーマ変更時に正規化
  try {
    updateCharacterTokenLabels()
  } catch {}

  if (!opts?.skipPersist) persistDocStyle()
}

const applyDocBg = (raw: string, opts?: { skipPersist?: boolean }) => {
  const parsed = normalizeHexColor(String(raw || '').trim())
  if (!parsed) return
  docBg.value = parsed
  docBgCode.value = parsed
  if (!opts?.skipPersist) persistDocStyle()
  // 背景色を親コンポーネントに通知
  emit('update:doc-bg', parsed)
}

const applyDocTextColor = (raw: string, opts?: { skipPersist?: boolean }) => {
  const parsed = normalizeHexColor(String(raw || '').trim())
  if (!parsed) return
  docTextColor.value = parsed
  docTextColorCode.value = parsed
  if (!opts?.skipPersist) persistDocStyle()
  // CSS変数を更新
  document.documentElement.style.setProperty('--doc-text-color', parsed)
  
  // アコーディオン枠線用に50%透明度の色を計算
  try {
    const hex = parsed.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    const rgba = `rgba(${r}, ${g}, ${b}, 0.5)`
    document.documentElement.style.setProperty('--accordion-border-color', rgba)
  } catch {}
}

const onThemeAccentPickerInput = (ev: Event) => {
  const v = (ev.target as HTMLInputElement | null)?.value || ''
  const parsed = normalizeHexColor(String(v || '').trim())
  if (!parsed) return
  themeAccentDraft.value = parsed
  themeAccentCodeDraft.value = parsed
}

const applyThemeAccentFromCode = () => {
  applyThemeAccent(themeAccentCodeDraft.value)
}

const onDocTextColorPickerInput = (ev: Event) => {
  const v = (ev.target as HTMLInputElement | null)?.value || ''
  const parsed = normalizeHexColor(String(v || '').trim())
  if (!parsed) return
  docTextColorCode.value = parsed
}

const applyDocTextColorFromCode = () => {
  applyDocTextColor(docTextColorCode.value)
}

const resetThemeAccent = () => {
  applyThemeAccent(DEFAULT_THEME_ACCENT)
  themeAccentDraft.value = DEFAULT_THEME_ACCENT
  themeAccentCodeDraft.value = DEFAULT_THEME_ACCENT
  // 背景色も初期化
  applyDocBg(DEFAULT_DOC_BG)
  // 文字色も初期化
  applyDocTextColor(DEFAULT_TEXT_COLOR)
}

const onDocBgPickerInput = (ev: Event) => {
  const v = (ev.target as HTMLInputElement | null)?.value || ''
  const parsed = normalizeHexColor(String(v || '').trim())
  if (!parsed) return
  docBgCode.value = parsed
}

const applyDocBgFromCode = () => {
  applyDocBg(docBgCode.value)
}

const toggleThemePopover = () => {
  const next = !isThemePopoverOpen.value
  isThemePopoverOpen.value = next
  if (next) {
    themeAccentDraft.value = themeAccent.value
    themeAccentCodeDraft.value = themeAccent.value
  }
}

const onHeadingAccentInput = (level: HeadingLevel) => {
  if (level === 'h1') headingAccentCustomH1.value = headingAccentH1.value !== themeAccent.value
  else if (level === 'h2') headingAccentCustomH2.value = headingAccentH2.value !== themeAccent.value
  else headingAccentCustomH3.value = headingAccentH3.value !== themeAccent.value
  persistDocStyle()
}

const setHeadingAccentToTheme = (level: HeadingLevel) => {
  if (level === 'h1') {
    headingAccentH1.value = themeAccent.value
    headingBgH1.value = docBg.value
    headingTextH1.value = docTextColor.value
    headingAccentCustomH1.value = false
  } else if (level === 'h2') {
    headingAccentH2.value = themeAccent.value
    headingBgH2.value = docBg.value
    headingTextH2.value = docTextColor.value
    headingAccentCustomH2.value = false
  } else {
    headingAccentH3.value = themeAccent.value
    headingBgH3.value = docBg.value
    headingTextH3.value = docTextColor.value
    headingAccentCustomH3.value = false
  }
  persistDocStyle()
}

const loadDocStyle = () => {
  if (!isBrowser) return
  try {
    const raw = window.localStorage.getItem(DOC_STYLE_STORAGE_KEY)
    if (!raw) return
    const obj = JSON.parse(raw || '{}')

    const bg = normalizeHexColor(String(obj?.docBg || '').trim())

    const tcwp = Number(obj?.twoColumnWidthPercent)
    if (Number.isFinite(tcwp) && tcwp > 0) twoColumnWidthPercent.value = Math.max(10, Math.min(90, tcwp))

    const accDef = normalizeAccordionStyle(obj?.accordionDefaultStyle ?? obj?.accordionStyle)
    if (accDef) accordionDefaultStyle.value = accDef

    const tcd = obj?.twoColDividerEnabled
    const tcdc = normalizeHexColor(String(obj?.twoColDividerColor || '').trim())
    if (typeof tcd === 'boolean') twoColDividerEnabled.value = tcd
    if (tcdc) twoColDividerColor.value = tcdc

    const theme = normalizeHexColor(String(obj?.themeAccent || '').trim())
    const f = String(obj?.fontTool || obj?.docFont || '').trim()
    const h = String(obj?.headingStyle || '').trim()
    const h1 = String(obj?.headingH1 || obj?.headingStyle || '').trim()
    const h2 = String(obj?.headingH2 || obj?.headingStyle || '').trim()
    const h3 = String(obj?.headingH3 || obj?.headingStyle || '').trim()

    const hf1 = String(obj?.headingFontH1 || '').trim()
    const hf2 = String(obj?.headingFontH2 || '').trim()
    const hf3 = String(obj?.headingFontH3 || '').trim()

    const ha1 = normalizeHexColor(String(obj?.headingAccentH1 || '').trim())
    const ha2 = normalizeHexColor(String(obj?.headingAccentH2 || '').trim())
    const ha3 = normalizeHexColor(String(obj?.headingAccentH3 || '').trim())

    const ht1 = normalizeHexColor(String(obj?.headingTextH1 || '').trim())
    const ht2 = normalizeHexColor(String(obj?.headingTextH2 || '').trim())
    const ht3 = normalizeHexColor(String(obj?.headingTextH3 || '').trim())

    const hb1 = normalizeHexColor(String(obj?.headingBgH1 || '').trim())
    const hb2 = normalizeHexColor(String(obj?.headingBgH2 || '').trim())
    const hb3 = normalizeHexColor(String(obj?.headingBgH3 || '').trim())

    if (theme) {
      themeAccent.value = theme
      themeAccentDraft.value = theme
      themeAccentCodeDraft.value = theme
      setThemeCssVar(theme)
    } else {
      themeAccent.value = DEFAULT_THEME_ACCENT
      themeAccentDraft.value = DEFAULT_THEME_ACCENT
      themeAccentCodeDraft.value = DEFAULT_THEME_ACCENT
      setThemeCssVar(DEFAULT_THEME_ACCENT)
    }

    if (bg) {
      docBg.value = bg
      docBgCode.value = bg
    } else {
      docBg.value = DEFAULT_DOC_BG
      docBgCode.value = DEFAULT_DOC_BG
    }

    const textColor = normalizeHexColor(String(obj?.docTextColor || '').trim())
    if (textColor) {
      docTextColor.value = textColor
      docTextColorCode.value = textColor
      document.documentElement.style.setProperty('--doc-text-color', textColor)
      // アコーディオン枠線用に50%透明度の色を計算
      try {
        const hex = textColor.replace('#', '')
        const r = parseInt(hex.substring(0, 2), 16)
        const g = parseInt(hex.substring(2, 4), 16)
        const b = parseInt(hex.substring(4, 6), 16)
        const rgba = `rgba(${r}, ${g}, ${b}, 0.5)`
        document.documentElement.style.setProperty('--accordion-border-color', rgba)
      } catch {}
    } else {
      docTextColor.value = DEFAULT_TEXT_COLOR
      docTextColorCode.value = DEFAULT_TEXT_COLOR
      document.documentElement.style.setProperty('--doc-text-color', DEFAULT_TEXT_COLOR)
      // デフォルトのアコーディオン枠線色
      try {
        const hex = DEFAULT_TEXT_COLOR.replace('#', '')
        const r = parseInt(hex.substring(0, 2), 16)
        const g = parseInt(hex.substring(2, 4), 16)
        const b = parseInt(hex.substring(4, 6), 16)
        const rgba = `rgba(${r}, ${g}, ${b}, 0.5)`
        document.documentElement.style.setProperty('--accordion-border-color', rgba)
      } catch {}
    }

    if (f === 'system' || f === 'gothic' || f === 'mincho' || f === 'serif' || f === 'mono') docFontSelect.value = f
    
    const validStyles: HeadingStyle[] = ['underline-solid', 'underline-dotted', 'underline-double', 'underline-dashed', 'box-solid', 'box-dotted', 'box-dashed', 'box-double', 'topbottom-solid', 'topbottom-dotted', 'topbottom-dashed', 'topbottom-double', 'underline-stripe', 'box-stripe', 'leftbar', 'bracket', 'line-accent', 'side-lines', 'simple', 'corner-triangle', 'bg-box']
    
    if (validStyles.includes(h1 as HeadingStyle)) headingStyleH1.value = h1 as HeadingStyle
    else if (validStyles.includes(h as HeadingStyle)) headingStyleH1.value = h as HeadingStyle
    if (validStyles.includes(h2 as HeadingStyle)) headingStyleH2.value = h2 as HeadingStyle
    else if (validStyles.includes(h as HeadingStyle)) headingStyleH2.value = h as HeadingStyle
    if (validStyles.includes(h3 as HeadingStyle)) headingStyleH3.value = h3 as HeadingStyle
    else if (validStyles.includes(h as HeadingStyle)) headingStyleH3.value = h as HeadingStyle

    if (hf1 === 'inherit' || hf1 === 'system' || hf1 === 'gothic' || hf1 === 'mincho' || hf1 === 'serif' || hf1 === 'mono') headingFontH1.value = hf1 as HeadingFont
    if (hf2 === 'inherit' || hf2 === 'system' || hf2 === 'gothic' || hf2 === 'mincho' || hf2 === 'serif' || hf2 === 'mono') headingFontH2.value = hf2 as HeadingFont
    if (hf3 === 'inherit' || hf3 === 'system' || hf3 === 'gothic' || hf3 === 'mincho' || hf3 === 'serif' || hf3 === 'mono') headingFontH3.value = hf3 as HeadingFont

    if (ha1) headingAccentH1.value = ha1
    if (ha2) headingAccentH2.value = ha2
    if (ha3) headingAccentH3.value = ha3
    if (ht1) headingTextH1.value = ht1
    if (ht2) headingTextH2.value = ht2
    if (ht3) headingTextH3.value = ht3
    if (hb1) headingBgH1.value = hb1
    if (hb2) headingBgH2.value = hb2
    if (hb3) headingBgH3.value = hb3

    const hs1 = Number(obj?.headingSizeH1)
    const hs2 = Number(obj?.headingSizeH2)
    const hs3 = Number(obj?.headingSizeH3)
    if (Number.isFinite(hs1) && hs1 >= 8 && hs1 <= 72) headingSizeH1.value = hs1
    if (Number.isFinite(hs2) && hs2 >= 8 && hs2 <= 72) headingSizeH2.value = hs2
    if (Number.isFinite(hs3) && hs3 >= 8 && hs3 <= 72) headingSizeH3.value = hs3

    const c1 = obj?.headingAccentCustomH1
    const c2 = obj?.headingAccentCustomH2
    const c3 = obj?.headingAccentCustomH3

    if (typeof c1 === 'boolean') headingAccentCustomH1.value = c1
    else headingAccentCustomH1.value = headingAccentH1.value !== themeAccent.value && headingAccentH1.value !== DEFAULT_H1_ACCENT
    if (typeof c2 === 'boolean') headingAccentCustomH2.value = c2
    else headingAccentCustomH2.value = headingAccentH2.value !== themeAccent.value && headingAccentH2.value !== DEFAULT_H2_ACCENT
    if (typeof c3 === 'boolean') headingAccentCustomH3.value = c3
    else headingAccentCustomH3.value = headingAccentH3.value !== themeAccent.value && headingAccentH3.value !== DEFAULT_H3_ACCENT

    if (themeAccent.value !== DEFAULT_THEME_ACCENT) {
      if (!headingAccentCustomH1.value && headingAccentH1.value === DEFAULT_H1_ACCENT) headingAccentH1.value = themeAccent.value
      if (!headingAccentCustomH2.value && headingAccentH2.value === DEFAULT_H2_ACCENT) headingAccentH2.value = themeAccent.value
      if (!headingAccentCustomH3.value && headingAccentH3.value === DEFAULT_H3_ACCENT) headingAccentH3.value = themeAccent.value
    }
  } catch {}
}

const persistDocStyle = () => {
  if (!isBrowser) return
  try {
    window.localStorage.setItem(
      DOC_STYLE_STORAGE_KEY,
      JSON.stringify({
        themeAccent: themeAccent.value,
        docBg: docBg.value,
        docTextColor: docTextColor.value,
        accordionDefaultStyle: accordionDefaultStyle.value,
        fontTool: docFontSelect.value,
        headingH1: headingStyleH1.value,
        headingH2: headingStyleH2.value,
        headingH3: headingStyleH3.value,

        headingFontH1: headingFontH1.value,
        headingFontH2: headingFontH2.value,
        headingFontH3: headingFontH3.value,

        headingAccentH1: headingAccentH1.value,
        headingAccentH2: headingAccentH2.value,
        headingAccentH3: headingAccentH3.value,

        headingTextH1: headingTextH1.value,
        headingTextH2: headingTextH2.value,
        headingTextH3: headingTextH3.value,

        headingBgH1: headingBgH1.value,
        headingBgH2: headingBgH2.value,
        headingBgH3: headingBgH3.value,

        headingSizeH1: headingSizeH1.value,
        headingSizeH2: headingSizeH2.value,
        headingSizeH3: headingSizeH3.value,

        twoColumnWidthPercent: twoColumnWidthPercent.value,
        twoColDividerEnabled: twoColDividerEnabled.value,
        twoColDividerColor: twoColDividerColor.value
      })
    )
  } catch {}
}

const onTwoColDividerColorInput = (ev: Event) => {
  const v = (ev.target as HTMLInputElement | null)?.value || ''
  const parsed = normalizeHexColor(String(v || '').trim())
  if (!parsed) return
  twoColDividerColor.value = parsed
  persistDocStyle()
}

const setTwoColDividerColorFromTextColor = () => {
  const textColor = docTextColor.value
  const hex = normalizeHexColor(textColor)
  if (hex) {
    twoColDividerColor.value = hex
    twoColDividerEnabled.value = true
    persistDocStyle()
  }
}

const headingFontOptions: Array<{ value: HeadingFont; label: string }> = [
  { value: 'inherit', label: '本文と同じ' },
  { value: 'system', label: '標準（ゴシック）' },
  { value: 'gothic', label: '日本語ゴシック' },
  { value: 'mincho', label: '日本語明朝' },
  { value: 'serif', label: 'セリフ' },
  { value: 'mono', label: '等幅' }
]

const getHeadingFontFamily = (font: HeadingFont): string => {
  if (font === 'inherit') return 'inherit'
  return getFontFamilyForTool(font)
}

const docHeadingVars = computed<Record<string, string>>(() => {
  return {
    '--doc-bg': docBg.value,
    '--h1-accent': headingAccentH1.value,
    '--h1-text': headingTextH1.value,
    '--h1-bg': headingBgH1.value,
    '--h1-font': getHeadingFontFamily(headingFontH1.value),
    '--h1-size': `${headingSizeH1.value}px`,

    '--h2-accent': headingAccentH2.value,
    '--h2-text': headingTextH2.value,
    '--h2-bg': headingBgH2.value,
    '--h2-font': getHeadingFontFamily(headingFontH2.value),
    '--h2-size': `${headingSizeH2.value}px`,

    '--h3-accent': headingAccentH3.value,
    '--h3-text': headingTextH3.value,
    '--h3-bg': headingBgH3.value,
    '--h3-font': getHeadingFontFamily(headingFontH3.value),
    '--h3-size': `${headingSizeH3.value}px`
  }
})

const applyHeadingVarsToElement = (el: HTMLElement) => {
  try {
    el.style.setProperty('--doc-bg', docBg.value)
    el.style.setProperty('--h1-accent', headingAccentH1.value)
    el.style.setProperty('--h1-text', headingTextH1.value)
    el.style.setProperty('--h1-bg', headingBgH1.value)
    el.style.setProperty('--h1-font', getHeadingFontFamily(headingFontH1.value))
    el.style.setProperty('--h1-size', `${headingSizeH1.value}px`)

    el.style.setProperty('--h2-accent', headingAccentH2.value)
    el.style.setProperty('--h2-text', headingTextH2.value)
    el.style.setProperty('--h2-bg', headingBgH2.value)
    el.style.setProperty('--h2-font', getHeadingFontFamily(headingFontH2.value))
    el.style.setProperty('--h2-size', `${headingSizeH2.value}px`)

    el.style.setProperty('--h3-accent', headingAccentH3.value)
    el.style.setProperty('--h3-text', headingTextH3.value)
    el.style.setProperty('--h3-bg', headingBgH3.value)
    el.style.setProperty('--h3-font', getHeadingFontFamily(headingFontH3.value))
    el.style.setProperty('--h3-size', `${headingSizeH3.value}px`)
  } catch {}
}

const applyImportedDocStyle = (raw: any) => {
  const obj = raw && typeof raw === 'object' ? raw : {}

  const theme = normalizeHexColor(String(obj?.themeAccent || '').trim())
  const bg = normalizeHexColor(String(obj?.docBg || '').trim())

  if (theme) {
    themeAccent.value = theme
    themeAccentCode.value = theme
    setThemeCssVar(theme)
  }
  if (bg) {
    docBg.value = bg
    docBgCode.value = bg
  }

  const h1 = String(obj?.headingH1 || '').trim()
  const h2 = String(obj?.headingH2 || '').trim()
  const h3 = String(obj?.headingH3 || '').trim()
  const validStyles: HeadingStyle[] = ['underline-solid', 'underline-dotted', 'underline-double', 'underline-dashed', 'box-solid', 'box-dotted', 'box-dashed', 'box-double', 'topbottom-solid', 'topbottom-dotted', 'topbottom-dashed', 'topbottom-double', 'underline-stripe', 'box-stripe', 'leftbar', 'bracket', 'line-accent', 'side-lines', 'simple', 'corner-triangle', 'bg-box']
  if (validStyles.includes(h1 as HeadingStyle)) headingStyleH1.value = h1 as HeadingStyle
  if (validStyles.includes(h2 as HeadingStyle)) headingStyleH2.value = h2 as HeadingStyle
  if (validStyles.includes(h3 as HeadingStyle)) headingStyleH3.value = h3 as HeadingStyle

  const hf1 = String(obj?.headingFontH1 || '').trim()
  const hf2 = String(obj?.headingFontH2 || '').trim()
  const hf3 = String(obj?.headingFontH3 || '').trim()
  if (hf1 === 'inherit' || hf1 === 'system' || hf1 === 'gothic' || hf1 === 'mincho' || hf1 === 'serif' || hf1 === 'mono') headingFontH1.value = hf1 as any
  if (hf2 === 'inherit' || hf2 === 'system' || hf2 === 'gothic' || hf2 === 'mincho' || hf2 === 'serif' || hf2 === 'mono') headingFontH2.value = hf2 as any
  if (hf3 === 'inherit' || hf3 === 'system' || hf3 === 'gothic' || hf3 === 'mincho' || hf3 === 'serif' || hf3 === 'mono') headingFontH3.value = hf3 as any

  const ha1 = normalizeHexColor(String(obj?.headingAccentH1 || '').trim())
  const ha2 = normalizeHexColor(String(obj?.headingAccentH2 || '').trim())
  const ha3 = normalizeHexColor(String(obj?.headingAccentH3 || '').trim())
  const ht1 = normalizeHexColor(String(obj?.headingTextH1 || '').trim())
  const ht2 = normalizeHexColor(String(obj?.headingTextH2 || '').trim())
  const ht3 = normalizeHexColor(String(obj?.headingTextH3 || '').trim())
  const hb1 = normalizeHexColor(String(obj?.headingBgH1 || '').trim())
  const hb2 = normalizeHexColor(String(obj?.headingBgH2 || '').trim())
  const hb3 = normalizeHexColor(String(obj?.headingBgH3 || '').trim())

  if (ha1) headingAccentH1.value = ha1
  if (ha2) headingAccentH2.value = ha2
  if (ha3) headingAccentH3.value = ha3
  if (ht1) headingTextH1.value = ht1
  if (ht2) headingTextH2.value = ht2
  if (ht3) headingTextH3.value = ht3
  if (hb1) headingBgH1.value = hb1
  if (hb2) headingBgH2.value = hb2
  if (hb3) headingBgH3.value = hb3

  const accDef = normalizeAccordionStyle(obj?.accordionDefaultStyle ?? obj?.accordionStyle)
  if (accDef) accordionDefaultStyle.value = accDef

  if (typeof obj?.headingAccentCustomH1 === 'boolean') headingAccentCustomH1.value = obj.headingAccentCustomH1
  else headingAccentCustomH1.value = headingAccentH1.value !== themeAccent.value
  if (typeof obj?.headingAccentCustomH2 === 'boolean') headingAccentCustomH2.value = obj.headingAccentCustomH2
  else headingAccentCustomH2.value = headingAccentH2.value !== themeAccent.value
  if (typeof obj?.headingAccentCustomH3 === 'boolean') headingAccentCustomH3.value = obj.headingAccentCustomH3
  else headingAccentCustomH3.value = headingAccentH3.value !== themeAccent.value

  persistDocStyle()
}

const resetDocStyleToDefaults = () => {
  // ローカルストレージを削除
  try {
    window.localStorage.removeItem(DOC_STYLE_STORAGE_KEY)
  } catch {}

  // テーマ色・背景色・文字色を初期化（resetThemeAccentと同じ処理）
  applyThemeAccent(DEFAULT_THEME_ACCENT)
  themeAccentDraft.value = DEFAULT_THEME_ACCENT
  themeAccentCodeDraft.value = DEFAULT_THEME_ACCENT
  applyDocBg(DEFAULT_DOC_BG)
  applyDocTextColor(DEFAULT_TEXT_COLOR)

  // アコーディオン
  accordionDefaultStyle.value = 'boxed'

  // フォント
  docFontSelect.value = 'system'

  // 見出しスタイル
  headingStyleH1.value = 'underline-solid'
  headingStyleH2.value = 'underline-solid'
  headingStyleH3.value = 'underline-solid'

  // 見出しフォント
  headingFontH1.value = 'inherit'
  headingFontH2.value = 'inherit'
  headingFontH3.value = 'inherit'

  // 見出しサイズ
  headingSizeH1.value = 24
  headingSizeH2.value = 20
  headingSizeH3.value = 16

  // 見出しの色をテーマに合わせる
  headingAccentH1.value = DEFAULT_THEME_ACCENT
  headingAccentH2.value = DEFAULT_THEME_ACCENT
  headingAccentH3.value = DEFAULT_THEME_ACCENT
  headingTextH1.value = DEFAULT_TEXT_COLOR
  headingTextH2.value = DEFAULT_TEXT_COLOR
  headingTextH3.value = DEFAULT_TEXT_COLOR
  headingBgH1.value = DEFAULT_DOC_BG
  headingBgH2.value = DEFAULT_DOC_BG
  headingBgH3.value = DEFAULT_DOC_BG
  headingAccentCustomH1.value = false
  headingAccentCustomH2.value = false
  headingAccentCustomH3.value = false

  // 2カラム設定
  twoColumnWidthPercent.value = 50
  twoColDividerEnabled.value = false
  twoColDividerColor.value = '#e5e7eb'

  // 最後に保存（applyThemeAccent等が既にpersistDocStyleを呼んでいるが、念のため）
  persistDocStyle()
}

const syncFontSizeSelectFromSelection = () => {
  const el = editorRef.value
  if (!el) return
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return
  if (!el.contains(selection.anchorNode)) return
  const px = Math.round(getCurrentFontSizePx())
  if (Number.isFinite(px) && px > 0) fontSizeSelect.value = String(px)
}

const getFontFamilyForTool = (font: DocFont): string => {
  if (font === 'gothic') {
    return '"Yu Gothic","Meiryo","Hiragino Sans",system-ui,-apple-system,"Segoe UI",sans-serif'
  }
  if (font === 'mincho') {
    return '"Yu Mincho","Hiragino Mincho ProN","MS Mincho","Times New Roman",serif'
  }
  if (font === 'serif') {
    return 'Georgia,"Times New Roman",serif'
  }
  if (font === 'mono') {
    return 'ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace'
  }
  return 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'
}

const applyFontFamily = (family: string) => {
  const el = editorRef.value
  if (!el) return

  const range = restoreSelectionForCommand()
  if (!range) return

  const selection = window.getSelection()
  if (!selection) return

  if (range.collapsed) {
    const span = document.createElement('span')
    span.style.fontFamily = family
    const zwsp = document.createTextNode('\u200b')
    span.appendChild(zwsp)
    range.insertNode(span)

    const caret = document.createRange()
    caret.setStart(zwsp, 1)
    caret.collapse(true)
    selection.removeAllRanges()
    selection.addRange(caret)
    savedRange.value = caret.cloneRange()

    runAfterDomMutation()
    return
  }

  const isInsideEditor = (n: Node | null) => {
    try {
      return !!(n && el.contains(n))
    } catch {
      return false
    }
  }

  const shouldSkipTextNode = (n: Node) => {
    const host = n.parentElement
    if (!host) return false
    if (host.closest('.char-token')) return true
    if (host.closest('.image-block')) return true
    return false
  }

  const collectTextNodesInRange = (r: Range) => {
    const nodes: Text[] = []
    const root: Node = (r.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? r.commonAncestorContainer
      : (r.commonAncestorContainer.parentNode || el))

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    let current: Node | null
    while ((current = walker.nextNode())) {
      if (!(current instanceof Text)) continue
      if (!isInsideEditor(current)) continue
      if (shouldSkipTextNode(current)) continue
      const text = current.nodeValue || ''
      if (!text) continue

      try {
        const nr = document.createRange()
        nr.selectNodeContents(current)
        const endsBefore = r.compareBoundaryPoints(Range.END_TO_START, nr) <= 0
        const startsAfter = r.compareBoundaryPoints(Range.START_TO_END, nr) >= 0
        if (endsBefore || startsAfter) continue
      } catch {
        // best-effort
      }

      nodes.push(current)
    }
    return nodes
  }

  const nodes = collectTextNodesInRange(range)
  if (!nodes.length) {
    // fallback: at least apply something
    tryEnableStyleWithCss()
    try {
      document.execCommand('fontName', false, family)
    } catch {}
    runAfterDomMutation()
    return
  }

  let lastWrapper: HTMLElement | null = null
  const nodesRev = nodes.slice().reverse()
  nodesRev.forEach((textNode) => {
    try {
      const fullLen = (textNode.nodeValue || '').length
      if (!fullLen) return

      const sub = document.createRange()
      const startOffset = (range.startContainer === textNode) ? range.startOffset : 0
      const endOffset = (range.endContainer === textNode) ? range.endOffset : fullLen
      const s = Math.max(0, Math.min(fullLen, startOffset))
      const e = Math.max(s, Math.min(fullLen, endOffset))
      if (s === e) return

      sub.setStart(textNode, s)
      sub.setEnd(textNode, e)

      const frag = sub.extractContents()
      const wrapper = document.createElement('span')
      wrapper.style.fontFamily = family
      wrapper.appendChild(frag)
      sub.insertNode(wrapper)
      lastWrapper = wrapper
    } catch {}
  })

  if (lastWrapper) {
    const after = document.createRange()
    after.setStartAfter(lastWrapper)
    after.collapse(true)
    selection.removeAllRanges()
    selection.addRange(after)
    savedRange.value = after.cloneRange()
  }

  runAfterDomMutation()
}

const onFontFamilyChange = () => {
  const family = getFontFamilyForTool(docFontSelect.value)
  applyFontFamily(family)
  persistDocStyle()
}

if (isBrowser) {
  const onDocMouseDown = (ev: MouseEvent) => {
    if (!openHeadingMenu.value) return
    const target = ev.target
    const hosts = [headingMenuEls.h1.value, headingMenuEls.h2.value, headingMenuEls.h3.value].filter(Boolean) as HTMLElement[]
    if (target instanceof Node && hosts.some((h) => h.contains(target))) return
    openHeadingMenu.value = null
  }
  document.addEventListener('mousedown', onDocMouseDown)
  onBeforeUnmount(() => {
    document.removeEventListener('mousedown', onDocMouseDown)
  })
}

// ---- character helpers
const getCharacterMap = () => {
  const map: Record<string, string> = {}
  const list = (props.characters || []) as any[]
  list.forEach((c) => {
    if (!c || !c.key) return
    map[c.key] = String(c.name || '')
  })
  return map
}

const getCharacterModeMap = () => {
  const map: Record<string, string> = {}
  const list = (props.characters || []) as any[]
  list.forEach((c) => {
    if (!c || !c.key) return
    map[c.key] = String(c.displayMode || 'plain')
  })
  return map
}

const getCharacterStyleMap = () => {
  const map: Record<string, { textColor?: string; backgroundColor?: string }> = {}
  const list = (props.characters || []) as any[]
  list.forEach((c) => {
    if (!c || !c.key) return
    const textColor = typeof c.textColor === 'string' && c.textColor.trim() ? c.textColor.trim() : undefined
    const backgroundColor = typeof c.backgroundColor === 'string' && c.backgroundColor.trim() ? c.backgroundColor.trim() : undefined
    map[c.key] = { textColor, backgroundColor }
  })
  return map
}

const applyCharacterStylesToToken = (span: HTMLElement, key: string) => {
  const style = getCharacterStyleMap()[key] || {}
  if (style.textColor) span.style.color = style.textColor
  else span.style.removeProperty('color')
  if (style.backgroundColor) span.style.backgroundColor = style.backgroundColor
  else span.style.removeProperty('background-color')
}

const applyCharacterStylesToSpeech = (span: HTMLElement, key: string) => {
  const style = getCharacterStyleMap()[key] || {}
  if (style.textColor) span.style.color = style.textColor
  else span.style.removeProperty('color')

  if (style.backgroundColor) {
    span.style.backgroundColor = style.backgroundColor
    span.style.padding = '0 2px'
    span.style.borderRadius = '4px'
  } else {
    span.style.removeProperty('background-color')
    span.style.removeProperty('padding')
    span.style.removeProperty('border-radius')
  }
}

const getCharacterName = (key: string) => {
  const name = getCharacterMap()[key]
  return name || key
}

const isWrappedForKey = (key: string) => {
  return getCharacterModeMap()[key] === 'wrapped'
}

const getCharacterLabel = (key: string) => {
  return getCharacterName(key)
}

// PDF等「装飾を付けず、キャラクター名だけを表示したい」用途
const resolveCharacterNamesPlainInHtml = (html: string) => {
  if (!html) return html

  const buildPlainSpanHtml = (keyRaw: string) => {
    const key = String(keyRaw)
    const label = escapeHtml(getCharacterLabel(key))
    const style = getCharacterStyleMap()[key] || {}
    const styleAttr = style.textColor ? ` style="color:${escapeHtml(style.textColor)}"` : ''
    return `<span data-char-key="${escapeHtml(key)}" data-char-plain="true"${styleAttr}>${label}</span>`
  }

  // まずはテキストトークン {{key}} を名前へ
  let out = html.replace(/{{([^}]+)}}/g, (_match, keyRaw) => {
    return buildPlainSpanHtml(String(keyRaw))
  })

  // 次に char-token span が残っている場合も、装飾なしの最小spanへ
  try {
    const doc = new DOMParser().parseFromString(`<div>${out}</div>`, 'text/html')
    const host = doc.body.firstElementChild as HTMLElement | null
    if (!host) return out

    const spans = Array.from(host.querySelectorAll('span.char-token')) as HTMLElement[]
    spans.forEach((span) => {
      const key = String(span.getAttribute('data-char-key') || '').trim()
      const plain = doc.createElement('span')
      if (key) plain.setAttribute('data-char-key', key)
      plain.setAttribute('data-char-plain', 'true')

      const label = key ? getCharacterLabel(key) : (span.textContent || '')
      plain.textContent = label

      if (key) {
        const style = getCharacterStyleMap()[key] || {}
        if (style.textColor) plain.style.color = style.textColor
      }

      span.replaceWith(plain)
    })

    return host.innerHTML
  } catch {
    return out
  }
}

// ---- selection helpers
const captureSelection = () => {
  const el = editorRef.value
  if (!el) return
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return
  const range = sel.getRangeAt(0)
  if (!el.contains(range.commonAncestorContainer)) return
  savedRange.value = range.cloneRange()
  // IME変換中にツールUI(reactive state)を更新すると再描画が走り、
  // 予測変換ウィンドウが左上に飛ぶ/確定入力が失敗することがある。
  if (isComposing.value) return
  syncFontSizeSelectFromSelection()
  updateLinkChipFromSelection()
}

const restoreSelectionForCommand = (): Range | null => {
  const el = editorRef.value
  if (!el) return null
  try {
    ;(el as any).focus?.({ preventScroll: true })
  } catch {
    el.focus()
  }

  const selection = window.getSelection()
  if (!selection) return null

  let range: Range | null = savedRange.value
  if (!range || !el.contains(range.commonAncestorContainer)) {
    if (selection.rangeCount > 0 && el.contains(selection.anchorNode)) {
      range = selection.getRangeAt(0).cloneRange()
    }
  }

  if (!range) {
    range = document.createRange()
    range.selectNodeContents(el)
    range.collapse(false)
  }

  selection.removeAllRanges()
  selection.addRange(range)
  return range
}

const tryEnableStyleWithCss = () => {
  try {
    document.execCommand('styleWithCSS', false, 'true')
  } catch {}
}

// ---- empty tail
const isEffectivelyEmptyTail = (p: HTMLParagraphElement) => {
  const text = (p.textContent || '').replace(/\u200b/g, '').trim()
  if (text) return false

  // テキストが空でも、BR以外の要素があれば「空ではない」とみなす
  const hasNonBrElement = Array.from(p.childNodes).some((n) => {
    if (n.nodeType !== Node.ELEMENT_NODE) return false
    return (n as Element).tagName !== 'BR'
  })
  if (hasNonBrElement) return false

  return true
}

const normalizeEmptyTail = () => {
  const el = editorRef.value
  if (!el) return
  const tails = Array.from(el.querySelectorAll('p[data-empty-tail="true"]')) as HTMLParagraphElement[]
  if (tails.length <= 1) {
    // tail が末尾に来るようだけ整える
    const only = tails[0]
    if (only && el.lastElementChild !== only) el.appendChild(only)
    return
  }

  const last = tails[tails.length - 1]
  // last 以外の tail は、通常段落に昇格（空行として残す）
  tails.slice(0, -1).forEach((t) => {
    delete t.dataset.emptyTail
  })

  if (el.lastElementChild !== last) el.appendChild(last)
}

const appendEmptyTailIfNeeded = () => {
  const el = editorRef.value
  if (!el) return

  const tail = el.querySelector('p[data-empty-tail="true"]') as HTMLParagraphElement | null
  if (tail) {
    // tail に内容が入ってしまった場合は通常段落に昇格させ、新しい空 tail を作る
    if (!isEffectivelyEmptyTail(tail)) {
      delete tail.dataset.emptyTail
      const p = document.createElement('p')
      p.dataset.emptyTail = 'true'
      p.innerHTML = '<br>'
      el.appendChild(p)
      return
    }
    if (el.lastElementChild !== tail) el.appendChild(tail)
    if (!tail.innerHTML) tail.innerHTML = '<br>'
    return
  }

  const p = document.createElement('p')
  p.dataset.emptyTail = 'true'
  p.innerHTML = '<br>'
  el.appendChild(p)
}

// ---- serialize/deserialize content
const renderCharacterTokens = () => {
  const el = editorRef.value
  if (!el) return

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || ''
      const regex = /{{([^}]+)}}/g
      if (!regex.test(text)) return
      regex.lastIndex = 0

      const frag = document.createDocumentFragment()
      let lastIndex = 0
      let match: RegExpExecArray | null
      while ((match = regex.exec(text)) !== null) {
        const key = String(match[1])
        const before = text.slice(lastIndex, match.index)
        if (before) frag.appendChild(document.createTextNode(before))

        const span = document.createElement('span')
        span.className = 'char-token'
        span.dataset.charKey = key
        span.dataset.wrapped = isWrappedForKey(key) ? 'true' : 'false'
        span.contentEditable = 'false'
        span.textContent = getCharacterName(key)
        applyCharacterStylesToToken(span, key)
        frag.appendChild(span)

        lastIndex = regex.lastIndex
      }
      const after = text.slice(lastIndex)
      if (after) frag.appendChild(document.createTextNode(after))

      node.parentNode?.replaceChild(frag, node)
      return
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const elNode = node as Element
      if (elNode.classList.contains('char-token')) return
      let child = node.firstChild
      while (child) {
        const next = child.nextSibling
        walk(child)
        child = next
      }
    }
  }

  walk(el)
}

const updateCharacterTokenLabels = () => {
  const el = editorRef.value
  if (!el) return
  const spans = el.querySelectorAll('span.char-token[data-char-key]')
  spans.forEach((span: any) => {
    span.contentEditable = 'false'
    const key = span.dataset.charKey
    if (!key) return
    span.dataset.wrapped = isWrappedForKey(key) ? 'true' : 'false'
    span.textContent = getCharacterName(String(key))
    applyCharacterStylesToToken(span as HTMLElement, String(key))
  })

  const speechSpans = el.querySelectorAll('span.char-speech[data-char-key]')
  speechSpans.forEach((span: any) => {
    const key = span.dataset.charKey
    if (!key) return
    applyCharacterStylesToSpeech(span as HTMLElement, String(key))
  })
}

const syncFromDom = () => {
  const el = editorRef.value
  if (!el) return

  const clone = el.cloneNode(true) as HTMLDivElement

  // エディタ上の一時的なUI状態は保存しない
  try {
    clone.querySelectorAll('.image-resize-handle,[data-editor-only="true"]').forEach((n) => n.remove())
  } catch {}
  try {
    clone.querySelectorAll('.image-block.is-selected').forEach((b) => (b as HTMLElement).classList.remove('is-selected'))
  } catch {}

  const spans = clone.querySelectorAll('span.char-token[data-char-key]')
  spans.forEach((span: any) => {
    const key = span?.dataset?.charKey
    if (!key) return
    span.replaceWith(document.createTextNode(`{{${key}}}`))
  })

  const tail = clone.querySelector('p[data-empty-tail="true"]')
  tail?.remove()

  const value = clone.innerHTML
  lastSyncedFromSelf.value = value
  emit('update:content', value)
}

// ---- TOC
const updateTocFromDom = () => {
  const el = editorRef.value
  if (!el) return

  const headings = Array.from(el.querySelectorAll('h1, h2, h3')) as HTMLElement[]
  ensureHeadingAnchorIds(headings)
  const items: TocItem[] = headings.map((h, index) => {
    const tag = h.tagName.toLowerCase()
    const level: 1 | 2 | 3 = tag === 'h1' ? 1 : tag === 'h2' ? 2 : 3
    const text = (h.textContent || '').replace(/\s+/g, ' ').trim() || '（無題）'
    return { index, level, text }
  })

  emit('toc-change', items)
}

const scrollToHeading = (index: number) => {
  const el = editorRef.value
  if (!el) return

  const headings = Array.from(el.querySelectorAll('h1, h2, h3')) as HTMLElement[]
  const target = headings[index]
  if (!target) return

  let p: HTMLElement | null = target.parentElement
  while (p) {
    if (p.tagName === 'DETAILS') {
      ;(p as HTMLDetailsElement).open = true
    }
    p = p.parentElement
  }

  try {
    ;(el as any).focus?.({ preventScroll: true })
  } catch {
    el.focus()
  }

  const sel = window.getSelection()
  if (sel) {
    const range = document.createRange()
    range.selectNodeContents(target)
    range.collapse(false)
    sel.removeAllRanges()
    sel.addRange(range)
    savedRange.value = range.cloneRange()
  }

  requestAnimationFrame(() => {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

// ---- history
const pushHistoryFromDom = () => {
  if (isApplyingHistory.value) return
  const el = editorRef.value
  if (!el) return

  const html = el.innerHTML
  if (historyIndex.value >= 0 && history.value[historyIndex.value] === html) return

  let base = history.value
  if (historyIndex.value < base.length - 1) {
    base = base.slice(0, historyIndex.value + 1)
  }
  base = base.concat(html)
  if (base.length > 50) base = base.slice(base.length - 50)

  history.value = base
  historyIndex.value = history.value.length - 1
}

const undo = () => {
  const el = editorRef.value
  if (!el) return
  if (historyIndex.value <= 0) return

  const newIndex = historyIndex.value - 1
  const html = history.value[newIndex]
  if (typeof html !== 'string') return

  isApplyingHistory.value = true
  historyIndex.value = newIndex
  el.innerHTML = html
  appendEmptyTailIfNeeded()
  syncFromDom()
  renderCharacterTokens()
  isApplyingHistory.value = false
  captureSelection()
  updateTocFromDom()
}

const redo = () => {
  const el = editorRef.value
  if (!el) return
  if (historyIndex.value >= history.value.length - 1) return

  const newIndex = historyIndex.value + 1
  const html = history.value[newIndex]
  if (typeof html !== 'string') return

  isApplyingHistory.value = true
  historyIndex.value = newIndex
  el.innerHTML = html
  appendEmptyTailIfNeeded()
  syncFromDom()
  renderCharacterTokens()
  isApplyingHistory.value = false
  captureSelection()
  updateTocFromDom()
}

// ---- formatting
const execInlineCommand = (command: string, value?: string) => {
  const el = editorRef.value
  if (!el) return
  restoreSelectionForCommand()
  tryEnableStyleWithCss()
  try {
    document.execCommand(command, false, value)
  } catch {
    return
  }
  runAfterDomMutation()
}

const toggleBold = () => execInlineCommand('bold')
const toggleItalic = () => execInlineCommand('italic')
const toggleUnderline = () => execInlineCommand('underline')
const toggleStrike = () => execInlineCommand('strikeThrough')

// ---- font size
const fontSizeSelect = ref('16')
const fontSizeOptions = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72]

const applyFontSize = (px: number) => {
  const el = editorRef.value
  if (!el) return

  const range = restoreSelectionForCommand()
  if (!range) return

  const selection = window.getSelection()
  if (!selection) return

  if (range.collapsed) {
    const span = document.createElement('span')
    span.style.fontSize = `${px}px`
    const zwsp = document.createTextNode('\u200b')
    span.appendChild(zwsp)
    range.insertNode(span)

    const caret = document.createRange()
    caret.setStart(zwsp, 1)
    caret.collapse(true)
    selection.removeAllRanges()
    selection.addRange(caret)
    savedRange.value = caret.cloneRange()

    runAfterDomMutation()
    return
  }

  const frag = range.extractContents()
  const wrapper = document.createElement('span')
  wrapper.style.fontSize = `${px}px`
  wrapper.appendChild(frag)
  range.insertNode(wrapper)

  // サイズ変更後も範囲選択を維持する
  const selected = document.createRange()
  selected.selectNodeContents(wrapper)
  selection.removeAllRanges()
  selection.addRange(selected)
  savedRange.value = selected.cloneRange()

  runAfterDomMutation()
}

const onFontSizeChange = () => {
  const raw = (fontSizeSelect.value || '').trim()
  const n = Number.parseInt(raw, 10)
  if (!Number.isFinite(n) || n <= 0) return
  applyFontSize(n)
}

const getCurrentFontSizePx = () => {
  const el = editorRef.value
  if (!el) return 16
  const range = restoreSelectionForCommand()
  if (!range) return 16

  let host: Element | null = null
  try {
    if (range.startContainer.nodeType === Node.ELEMENT_NODE) host = range.startContainer as Element
    else host = (range.startContainer as any)?.parentElement || null
  } catch {}

  if (!host) host = el
  try {
    const style = window.getComputedStyle(host)
    const px = Number.parseFloat(String(style.fontSize || '16'))
    if (Number.isFinite(px) && px > 0) return px
  } catch {}
  return 16
}

const nudgeFontSize = (delta: number) => {
  const current = Math.round(getCurrentFontSizePx())
  const options = fontSizeOptions.slice().sort((a, b) => a - b)
  if (!options.length) return

  let nearestIndex = 0
  let nearestDist = Number.POSITIVE_INFINITY
  options.forEach((v, i) => {
    const d = Math.abs(v - current)
    if (d < nearestDist) {
      nearestDist = d
      nearestIndex = i
    }
  })

  const nextIndex = Math.max(0, Math.min(options.length - 1, nearestIndex + (delta < 0 ? -1 : 1)))
  const next = options[nextIndex]
  applyFontSize(next)
  fontSizeSelect.value = String(next)
}

// ---- indent
const getBlocksInSelection = (): HTMLElement[] => {
  const el = editorRef.value
  if (!el) return []

  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return []
  if (!el.contains(selection.anchorNode)) return []

  const range = selection.getRangeAt(0)
  const blocks = Array.from(el.querySelectorAll('p, h1, h2, h3, details.accordion, li')) as HTMLElement[]
  const filtered = blocks.filter((b) => {
    if (b.tagName.toLowerCase() === 'p' && (b as any).dataset?.emptyTail === 'true') return false
    try {
      return range.intersectsNode(b)
    } catch {
      return b.contains(range.startContainer) || b.contains(range.endContainer)
    }
  })

  if (filtered.length) return filtered

  const base = selection.anchorNode && selection.anchorNode.nodeType === Node.TEXT_NODE
    ? (selection.anchorNode.parentElement || null)
    : (selection.anchorNode as Element | null)

  const host = base instanceof Element ? base : null
  const block = host ? (host.closest('p, h1, h2, h3, details.accordion, li') as HTMLElement | null) : null
  return block ? [block] : []
}

const adjustIndent = (delta: number) => {
  const blocks = getBlocksInSelection()
  if (!blocks.length) return

  const step = 24
  blocks.forEach((b) => {
    const current = Number.parseInt((b.style.marginLeft || '0').replace('px', ''), 10) || 0
    const next = current + (delta * step)
    if (next <= 0) {
      b.style.marginLeft = ''
      return
    }
    b.style.marginLeft = `${next}px`
  })

  runAfterDomMutation()
}

const indentIncrease = () => {
  restoreSelectionForCommand()
  adjustIndent(1)
}

const indentDecrease = () => {
  restoreSelectionForCommand()
  adjustIndent(-1)
}

// ---- colors
const colorMenuRef = ref<HTMLElement | null>(null)
const isColorPopoverOpen = ref(false)

const TEXT_COLOR_HISTORY_KEY = 'htmlmaker:recentTextColors'
const BG_COLOR_HISTORY_KEY = 'htmlmaker:recentBackgroundColors'

const textColors = ['#111827', '#374151', '#6b7280', '#ffffff', '#ef4444', '#f97316', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899']
const backgroundColors = ['#ffffff', '#f3f4f6', '#fef3c7', '#dcfce7', '#dbeafe', '#ede9fe', '#fee2e2', '#e5e7eb']

const textColorStorage = useRecentColorStorage(TEXT_COLOR_HISTORY_KEY, { isBrowser })
const backgroundColorStorage = useRecentColorStorage(BG_COLOR_HISTORY_KEY, { isBrowser })

const recentTextColors = textColorStorage.recentColors
const recentBackgroundColors = backgroundColorStorage.recentColors

const newTextColor = ref('#111827')
const newTextColorCode = ref('#111827')
const newBackgroundColor = ref('#ffffff')
const newBackgroundColorCode = ref('#ffffff')

const loadRecentColors = () => {
  textColorStorage.load()
  backgroundColorStorage.load()
}

const toggleColorPopover = () => {
  if (!isColorPopoverOpen.value) captureSelection()
  isColorPopoverOpen.value = !isColorPopoverOpen.value
}

const toggleColumnsPopover = () => {
  const next = !isColumnsPopoverOpen.value
  if (next) captureSelection()
  isColumnsPopoverOpen.value = next
}

const isElementInEditor = (el: Element | null): el is HTMLElement => {
  const root = editorRef.value
  return !!(root && el && el instanceof HTMLElement && root.contains(el))
}

const findNearestBlockHost = (from: Node | null): HTMLElement | null => {
  const root = editorRef.value
  if (!root || !from) return null
  let el: HTMLElement | null = from instanceof HTMLElement ? from : (from.parentElement || null)
  while (el && el !== root) {
    const tag = el.tagName
    if (
      tag === 'P' || tag === 'DIV' || tag === 'SECTION' || tag === 'ARTICLE' ||
      tag === 'UL' || tag === 'OL' || tag === 'LI' || tag === 'BLOCKQUOTE' ||
      tag === 'DETAILS' || tag === 'H1' || tag === 'H2' || tag === 'H3'
    ) {
      return el
    }
    el = el.parentElement
  }
  return null
}

const applyTwoColumnsToElement = (el: HTMLElement, enabled: boolean) => {
  if (!isElementInEditor(el)) return

  if (enabled) {
    el.style.setProperty('--two-col-left', `${Math.max(10, Math.min(90, twoColumnWidthPercent.value))}%`)

    if (twoColDividerEnabled.value) {
      el.setAttribute('data-divider', '1')
      const parsed = normalizeHexColor(twoColDividerColor.value) || '#e5e7eb'
      el.style.setProperty('--two-col-divider', parsed)
    } else {
      el.removeAttribute('data-divider')
      try { el.style.removeProperty('--two-col-divider') } catch {}
    }
  } else {
    try { el.style.removeProperty('--two-col-left') } catch {}
    try { el.style.removeProperty('--two-col-divider') } catch {}
    try { el.removeAttribute('data-divider') } catch {}
  }
}

const createEmptyParagraph = (): HTMLElement => {
  const p = document.createElement('p')
  p.appendChild(document.createElement('br'))
  return p
}

const findNearestTwoColBlock = (from: Node | null): HTMLElement | null => {
  const root = editorRef.value
  if (!root || !from) return null
  const start = from instanceof HTMLElement ? from : (from.parentElement || null)
  const host = start?.closest?.('.two-col-block')
  if (!host || !(host instanceof HTMLElement)) return null
  if (!root.contains(host)) return null
  return host
}

const unwrapTwoColBlock = (block: HTMLElement) => {
  const root = editorRef.value
  if (!root || !root.contains(block)) return
  const parent = block.parentNode
  if (!parent) return

  const left = block.querySelector(':scope > .two-col-col.col-left') as HTMLElement | null
  const right = block.querySelector(':scope > .two-col-col.col-right') as HTMLElement | null

  const insertPoint = block
  const moveOut = (col: HTMLElement | null) => {
    if (!col) return
    const kids = Array.from(col.childNodes)
    for (const n of kids) {
      try { parent.insertBefore(n, insertPoint) } catch {}
    }
  }

  try {
    moveOut(left)
    moveOut(right)
    parent.removeChild(block)
  } catch {}
}

const applyTwoColumns = (enabled: boolean) => {
  const root = editorRef.value
  if (!root) return

  restoreSelectionForCommand()
  const sel = window.getSelection()
  const range = sel && sel.rangeCount ? sel.getRangeAt(0) : null
  if (!range) {
    alert('適用する位置（カーソルまたは選択範囲）が見つかりませんでした。')
    return
  }

  if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) {
    alert('エディタ内で選択してから実行してください。')
    return
  }

  // 解除は「現在位置から一番近い2列ブロック」を対象
  if (!enabled) {
    const existing = findNearestTwoColBlock(sel?.focusNode || range.startContainer)
    if (existing) unwrapTwoColBlock(existing)
    runAfterDomMutation()
    return
  }

  // すでに2列ブロック内なら「比率だけ更新」
  const existing = findNearestTwoColBlock(sel?.focusNode || range.startContainer)
  if (existing) {
    applyTwoColumnsToElement(existing, true)
    runAfterDomMutation()
    return
  }

  // 選択範囲ありで、複数の直下ブロックにまたがる場合は左列にまとめて2列ブロック化
  if (!range.collapsed) {
    const selectedChildren: Node[] = []
    const children = Array.from(root.childNodes)
    for (const n of children) {
      try {
        if (range.intersectsNode(n)) selectedChildren.push(n)
      } catch {}
    }

    if (selectedChildren.length >= 2) {
      const block = document.createElement('div')
      block.className = 'two-col-block'
      applyTwoColumnsToElement(block, true)

      const left = document.createElement('div')
      left.className = 'two-col-col col-left'
      const right = document.createElement('div')
      right.className = 'two-col-col col-right'
      right.appendChild(createEmptyParagraph())

      block.appendChild(left)
      block.appendChild(right)
      root.insertBefore(block, selectedChildren[0])
      for (const n of selectedChildren) {
        try { left.appendChild(n) } catch {}
      }
      runAfterDomMutation()
      return
    }
  }

  // それ以外はカーソル位置（または選択開始位置）のブロック要素を左列に入れて2列ブロック化
  const target = findNearestBlockHost(range.startContainer)
  if (!target) {
    alert('二段組を適用できる要素が見つかりませんでした。')
    return
  }

  const block = document.createElement('div')
  block.className = 'two-col-block'
  applyTwoColumnsToElement(block, true)

  const left = document.createElement('div')
  left.className = 'two-col-col col-left'
  const right = document.createElement('div')
  right.className = 'two-col-col col-right'
  right.appendChild(createEmptyParagraph())

  block.appendChild(left)
  block.appendChild(right)
  try {
    root.insertBefore(block, target)
    left.appendChild(target)
  } catch {}
  runAfterDomMutation()
}

const applyTextColor = (color: string) => {
  execInlineCommand('foreColor', color)
}

const applyBackgroundColor = (color: string) => {
  const el = editorRef.value
  if (!el) return
  restoreSelectionForCommand()
  tryEnableStyleWithCss()

  let ok = false
  try {
    ok = document.execCommand('hiliteColor', false, color)
  } catch {
    ok = false
  }
  if (!ok) {
    try {
      document.execCommand('backColor', false, color)
    } catch {}
  }
  runAfterDomMutation()
}

const addRecentTextColor = () => {
  const parsed = normalizeHexColor(newTextColor.value) || normalizeHexColor(newTextColorCode.value)
  if (!parsed) {
    alert('カラーコードは #rrggbb または #rgb 形式で入力してください。')
    return
  }
  newTextColor.value = parsed
  newTextColorCode.value = parsed
  applyTextColor(parsed)
}

const addRecentBackgroundColor = () => {
  const parsed = normalizeHexColor(newBackgroundColor.value) || normalizeHexColor(newBackgroundColorCode.value)
  if (!parsed) {
    alert('カラーコードは #rrggbb または #rgb 形式で入力してください。')
    return
  }
  newBackgroundColor.value = parsed
  newBackgroundColorCode.value = parsed
  applyBackgroundColor(parsed)
}

if (isBrowser) {
  const onDocMouseDown = (ev: MouseEvent) => {
    if (!isColorPopoverOpen.value) return
    const host = colorMenuRef.value
    const target = ev.target
    if (host && target instanceof Node && host.contains(target)) return
    isColorPopoverOpen.value = false
  }
  document.addEventListener('mousedown', onDocMouseDown)
  onBeforeUnmount(() => {
    document.removeEventListener('mousedown', onDocMouseDown)
  })
}

if (isBrowser) {
  const onDocMouseDown = (ev: MouseEvent) => {
    if (!isThemePopoverOpen.value) return
    const host = themeMenuRef.value
    const target = ev.target
    if (host && target instanceof Node && host.contains(target)) return
    isThemePopoverOpen.value = false
  }
  document.addEventListener('mousedown', onDocMouseDown)
  onBeforeUnmount(() => {
    document.removeEventListener('mousedown', onDocMouseDown)
  })
}

if (isBrowser) {
  const onDocMouseDown = (ev: MouseEvent) => {
    if (!isColumnsPopoverOpen.value) return
    const host = columnsMenuRef.value
    const target = ev.target
    if (host && target instanceof Node && host.contains(target)) return
    isColumnsPopoverOpen.value = false
  }
  document.addEventListener('mousedown', onDocMouseDown)
  onBeforeUnmount(() => {
    document.removeEventListener('mousedown', onDocMouseDown)
  })
}

// ---- link
const linkMenuRef = ref<HTMLElement | null>(null)
const isLinkPopoverOpen = ref(false)
const linkUrl = ref('https://')
const linkText = ref('')

type HeadingAnchorOption = { id: string; level: 1 | 2 | 3; text: string; label: string }
const headingAnchorOptions = ref<HeadingAnchorOption[]>([])
const linkHeadingId = ref('')

const truncateForOptionLabel = (text: string, max = 42) => {
  const t = (text || '').replace(/\s+/g, ' ').trim()
  if (!t) return ''
  if (t.length <= max) return t
  return `${t.slice(0, Math.max(0, max - 1))}…`
}

const isLinkChipVisible = ref(false)
const linkChipUrl = ref('')
const linkChipX = ref(0)
const linkChipY = ref(0)
const linkChipStyle = computed(() => {
  return {
    left: `${linkChipX.value}px`,
    top: `${linkChipY.value}px`
  }
})

const hideLinkChip = () => {
  isLinkChipVisible.value = false
  linkChipUrl.value = ''
}

const closeLinkPopover = () => {
  isLinkPopoverOpen.value = false
}

const toggleLinkPopover = () => {
  const next = !isLinkPopoverOpen.value
  isLinkPopoverOpen.value = next
  if (next) {
    prefillLinkInputsFromSelection()
    refreshHeadingAnchorsForLinkPopover()
    syncLinkHeadingIdFromUrl()
  }
}

const generateHeadingAnchorId = () => {
  try {
    const id = (window.crypto as any)?.randomUUID?.()
    if (id) return `hm-h-${id}`
  } catch {}
  return `hm-h-${Date.now()}-${Math.floor(Math.random() * 1e9)}`
}

const ensureHeadingAnchorIds = (headings: HTMLElement[]) => {
  const used = new Set<string>()
  headings.forEach((h) => {
    const existing = (h.getAttribute('id') || '').trim()
    if (existing) used.add(existing)
  })

  headings.forEach((h) => {
    const currentId = (h.getAttribute('id') || '').trim()
    if (currentId) return

    const saved = String((h as any)?.dataset?.hmAnchorId || '').trim()
    let id = saved || generateHeadingAnchorId()
    while (used.has(id)) id = `${id}-1`
    try {
      ;(h as any).dataset.hmAnchorId = id
    } catch {}
    h.setAttribute('id', id)
    used.add(id)
  })
}

const refreshHeadingAnchorsForLinkPopover = () => {
  const el = editorRef.value
  if (!el) {
    headingAnchorOptions.value = []
    return
  }
  const headings = Array.from(el.querySelectorAll('h1, h2, h3')) as HTMLElement[]
  ensureHeadingAnchorIds(headings)
  headingAnchorOptions.value = headings.map((h) => {
    const tag = h.tagName.toLowerCase()
    const level: 1 | 2 | 3 = tag === 'h1' ? 1 : tag === 'h2' ? 2 : 3
    const text = (h.textContent || '').replace(/\s+/g, ' ').trim() || '（無題）'
    const id = String(h.getAttribute('id') || '').trim()
    const indent = level === 1 ? '' : level === 2 ? '\u00A0\u00A0' : '\u00A0\u00A0\u00A0\u00A0'
    return { id, level, text, label: `${indent}${truncateForOptionLabel(text)}` }
  }).filter((o) => !!o.id)
}

const syncLinkHeadingIdFromUrl = () => {
  const v = (linkUrl.value || '').trim()
  if (v.startsWith('#') && v.length > 1) {
    linkHeadingId.value = v.slice(1)
  } else {
    linkHeadingId.value = ''
  }
}

const onLinkHeadingSelectChange = (ev: Event) => {
  const id = (ev.target as HTMLSelectElement | null)?.value || ''
  linkHeadingId.value = id
  if (!id) return
  linkUrl.value = `#${id}`

  const range = savedRange.value
  if (range && !range.collapsed) return
  if ((linkText.value || '').trim()) return
  const found = headingAnchorOptions.value.find((h) => h.id === id)
  if (found) linkText.value = found.text
}

const getAnchorFromRange = (range: Range | null): HTMLAnchorElement | null => {
  const el = editorRef.value
  if (!el || !range) return null
  try {
    const baseNode = range.startContainer
    const baseEl = (baseNode.nodeType === Node.ELEMENT_NODE
      ? (baseNode as Element)
      : (baseNode.parentElement || null))
    const a = baseEl?.closest('a') as HTMLAnchorElement | null
    if (a && el.contains(a)) return a
  } catch {}
  return null
}

const prefillLinkInputsFromSelection = () => {
  const range = savedRange.value
  if (!range) return

  if (!range.collapsed) {
    const selected = (range.toString() || '').trim()
    if (selected) linkText.value = selected
    return
  }

  const a = getAnchorFromRange(range)
  if (!a) return
  const href = String(a.getAttribute('href') || '').trim()
  if (href) linkUrl.value = href
  const txt = (a.textContent || '').trim()
  if (txt) linkText.value = txt
}

const updateLinkChipFromSelection = () => {
  const el = editorRef.value
  if (!el) return hideLinkChip()

  const range = savedRange.value
  if (!range) return hideLinkChip()
  if (!range.collapsed) return hideLinkChip()

  const a = getAnchorFromRange(range)
  if (!a) return hideLinkChip()
  const href = String(a.getAttribute('href') || '').trim()
  if (!href) return hideLinkChip()

  let rect: DOMRect | null = null
  try {
    const r = range.getBoundingClientRect()
    if (r && (r.width > 0 || r.height > 0)) rect = r
  } catch {}
  if (!rect) {
    try {
      rect = a.getBoundingClientRect()
    } catch {}
  }
  if (!rect) return hideLinkChip()

  const chipMaxW = 360
  const padding = 10
  const x = Math.max(padding, Math.min(window.innerWidth - chipMaxW - padding, rect.left))
  const y = Math.max(padding, Math.min(window.innerHeight - 44 - padding, rect.bottom + 8))

  linkChipUrl.value = href
  linkChipX.value = Math.round(x)
  linkChipY.value = Math.round(y)
  isLinkChipVisible.value = true
}

const normalizeUrl = (raw: string) => {
  const v = (raw || '').trim()
  if (!v) return ''
  if (/^(https?:\/\/|mailto:|tel:)/i.test(v)) return v
  if (v.startsWith('#')) return v
  return `https://${v}`
}

const applyLinkFromPopover = () => {
  const el = editorRef.value
  if (!el) return

  const url = normalizeUrl(linkUrl.value)
  if (!url) return

  const range = restoreSelectionForCommand()
  if (!range) return

  const selection = window.getSelection()
  if (!selection) return

  const applyAnchorAttrs = (a: HTMLAnchorElement) => {
    a.href = url
    if (url.startsWith('#')) {
      a.removeAttribute('target')
      a.removeAttribute('rel')
      return
    }
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
  }

  if (range.collapsed) {
    const a = document.createElement('a')
    applyAnchorAttrs(a)
    const text = (linkText.value || '').trim() || url
    a.textContent = text

    range.deleteContents()
    range.insertNode(a)

    const after = document.createRange()
    after.setStartAfter(a)
    after.collapse(true)
    selection.removeAllRanges()
    selection.addRange(after)
    savedRange.value = after.cloneRange()
    runAfterDomMutation()
    closeLinkPopover()
    return
  }

  // 選択中の内容はそのままリンク化（入力の表示文字で置換しない）
  const frag = range.extractContents()
  const a = document.createElement('a')
  applyAnchorAttrs(a)
  a.appendChild(frag)
  range.insertNode(a)

  const selected = document.createRange()
  selected.selectNodeContents(a)
  selection.removeAllRanges()
  selection.addRange(selected)
  savedRange.value = selected.cloneRange()

  runAfterDomMutation()
  closeLinkPopover()
}

registerOutsideClose({
  isOpen: () => isLinkPopoverOpen.value,
  getHost: () => linkMenuRef.value,
  onClose: () => {
    isLinkPopoverOpen.value = false
  }
})

registerOutsideClose({
  isOpen: () => isAccordionPopoverOpen.value,
  getHost: () => accordionMenuRef.value,
  onClose: () => {
    isAccordionPopoverOpen.value = false
  }
})

registerOutsideClose({
  isOpen: () => isImageWidthPopoverOpen.value,
  getHost: () => imageWidthMenuRef.value,
  onClose: () => {
    isImageWidthPopoverOpen.value = false
  }
})

registerOutsideClose({
  isOpen: () => !!openHeadingMenu.value,
  getHost: () => {
    const level = openHeadingMenu.value
    return level ? headingMenuEls[level].value : null
  },
  onClose: () => {
    openHeadingMenu.value = null
  }
})

registerOutsideClose({
  isOpen: () => isTextStylePopoverOpen.value,
  getHost: () => textStyleMenuRef.value,
  onClose: () => {
    isTextStylePopoverOpen.value = false
  }
})

registerOutsideClose({
  isOpen: () => isDividerPopoverOpen.value,
  getHost: () => dividerMenuRef.value,
  onClose: () => {
    isDividerPopoverOpen.value = false
  }
})

// ---- images
const INLINE_IMAGE_WARN_BYTES = 1_500_000

const clearSelectedImage = () => {
  if (selectedImageBlock.value) {
    try {
      selectedImageBlock.value.classList.remove('is-selected')
    } catch {}
  }
  selectedImageBlock.value = null
}

const selectImageBlock = (block: HTMLElement) => {
  if (!block) return
  const el = editorRef.value
  if (!el || !el.contains(block)) return

  // 保存データから復元した場合、リサイズハンドルは残らないので都度復元する
  try {
    const existing = block.querySelector(':scope > .image-resize-handle') as HTMLElement | null
    if (!existing) {
      const handle = document.createElement('span')
      handle.className = 'image-resize-handle'
      handle.setAttribute('data-editor-only', 'true')
      ;(handle as any).contentEditable = 'false'
      block.insertBefore(handle, block.firstChild)
    } else {
      existing.setAttribute('data-editor-only', 'true')
      ;(existing as any).contentEditable = 'false'
    }
  } catch {}

  clearSelectedImage()
  selectedImageBlock.value = block
  try {
    block.classList.add('is-selected')
  } catch {}

  imageLayoutSelect.value = getImageLayoutForBlock(block)
  imageWidthPercent.value = getImageWidthPercent(block)

  // クリック直後に入力できるよう、キャレットは画像の後ろへ
  const sel = window.getSelection()
  if (!sel) return
  const r = document.createRange()
  r.setStartAfter(block)
  r.collapse(true)
  sel.removeAllRanges()
  sel.addRange(r)
  savedRange.value = r.cloneRange()
}

const getImageWidthPercent = (block: HTMLElement) => {
  const raw = String(block.style.width || '').trim()
  if (raw.endsWith('%')) {
    const n = Number.parseInt(raw.replace('%', ''), 10)
    if (Number.isFinite(n)) return Math.max(5, Math.min(100, n))
  }
  return 100
}

const refreshImageWidthPopover = () => {
  const block = selectedImageBlock.value
  if (!block) return
  imageWidthPercent.value = getImageWidthPercent(block)
}

const toggleImageWidthPopover = () => {
  const next = !isImageWidthPopoverOpen.value
  isImageWidthPopoverOpen.value = next
  if (next) refreshImageWidthPopover()
}

const applyImageWidthToSelected = () => {
  const block = selectedImageBlock.value
  if (!block) return
  const n = Number.isFinite(imageWidthPercent.value) ? imageWidthPercent.value : 100
  const clamped = Math.max(5, Math.min(100, Math.round(n)))
  imageWidthPercent.value = clamped
  block.style.width = `${clamped}%`
  runAfterDomMutation()
}

const getImageLayoutForBlock = (block: HTMLElement): ImageLayout => {
  const v = String(block.getAttribute('data-image-layout') || '').trim()
  if (v === 'left' || v === 'center' || v === 'right' || v === 'float-left' || v === 'float-right') return v
  return 'inline'
}

const applyImageLayoutToBlock = (block: HTMLElement, layout: ImageLayout) => {
  if (!block) return
  block.setAttribute('data-image-layout', layout)
}

const onImageLayoutChange = () => {
  const block = selectedImageBlock.value
  if (!block) return
  applyImageLayoutToBlock(block, imageLayoutSelect.value)
  runAfterDomMutation()
}

const isResizeHandleTarget = (t: Element | null) => {
  if (!t) return false
  return t.classList.contains('image-resize-handle')
}

const isImageBlockTarget = (t: Element | null) => {
  if (!t) return false
  return t.classList.contains('image-block')
}

const resizingState = ref<null | {
  block: HTMLElement
  startX: number
  startY: number
  startWidth: number
  startHeight: number
}>(null)

const beginImageResize = (block: HTMLElement, ev: MouseEvent) => {
  const img = block.querySelector('img') as HTMLImageElement | null
  if (!img) return

  const r = block.getBoundingClientRect()
  const ir = img.getBoundingClientRect()
  const startWidth = Math.max(1, r.width)
  const startHeight = Math.max(1, ir.height || r.height)

  resizingState.value = {
    block,
    startX: ev.clientX,
    startY: ev.clientY,
    startWidth,
    startHeight
  }

  const onMove = (e: MouseEvent) => {
    const st = resizingState.value
    if (!st) return

    const dx = e.clientX - st.startX
    const dy = e.clientY - st.startY

    const sx = (st.startWidth + dx) / st.startWidth
    const sy = (st.startHeight + dy) / st.startHeight
    let s = Math.max(sx, sy)
    if (!Number.isFinite(s)) s = 1
    s = Math.max(0.1, Math.min(6, s))

    const newW = Math.round(st.startWidth * s)
    st.block.style.width = `${Math.max(40, newW)}px`
  }

  const onUp = () => {
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
    resizingState.value = null
    runAfterDomMutation()
  }

  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}

const onEditorMousedown = (event: MouseEvent) => {
  const el = editorRef.value
  if (!el) return
  const t = event.target
  if (!(t instanceof Element)) return

  lastMouseDownPos.value = { x: event.clientX, y: event.clientY }

  if (isResizeHandleTarget(t)) {
    const block = t.closest('.image-block') as HTMLElement | null
    if (block && el.contains(block)) {
      event.preventDefault()
      event.stopPropagation()
      selectImageBlock(block)
      beginImageResize(block, event)
    }
    return
  }

  if (isImageBlockTarget(t)) {
    // 画像自体のドラッグ等でフォーカスが変なところへ飛ぶのを防ぐ
    event.preventDefault()
  }
}

const onEditorMouseup = (event: MouseEvent) => {
  captureSelection()

  const sel = window.getSelection()
  if (sel && !sel.isCollapsed && lastMouseDownPos.value) {
    const dx = Math.abs(event.clientX - lastMouseDownPos.value.x)
    const dy = Math.abs(event.clientY - lastMouseDownPos.value.y)
    if (dx + dy > 3) {
      skipClearSelectionOnce.value = true
    }
  }

  lastMouseDownPos.value = null
}

const getTopLevelBlock = (target: Element, root: HTMLElement) => {
  let el: Element | null = target
  while (el && el.parentElement && el.parentElement !== root) {
    el = el.parentElement
  }
  if (el && el.parentElement === root) return el as HTMLElement
  return null
}

const getBlockText = (el: HTMLElement) => {
  const raw = (el as any).innerText
  if (typeof raw === 'string') return raw
  return el.textContent || ''
}

const copyTextToClipboard = async (text: string) => {
  const value = String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trimEnd()
  if (!value) return
  try {
    await navigator.clipboard.writeText(value)
    return
  } catch {}
  try {
    const textarea = document.createElement('textarea')
    textarea.value = value
    textarea.style.position = 'fixed'
    textarea.style.top = '-9999px'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  } catch {}
}

const onEditorClick = (event: MouseEvent) => {
  const el = editorRef.value
  if (!el) return
  const t = event.target
  if (!(t instanceof Element)) {
    clearSelectedImage()
    captureSelection()
    return
  }

  // 内部リンク(#...)はエディタ内スクロールへ変換
  const a = t.closest('a') as HTMLAnchorElement | null
  if (a && el.contains(a)) {
    const href = String(a.getAttribute('href') || '').trim()
    if (href.startsWith('#') && href.length > 1) {
      event.preventDefault()
      event.stopPropagation()
      const id = href.slice(1)
      const target = el.querySelector(`#${CSS.escape(id)}`) as HTMLElement | null
      if (target) {
        requestAnimationFrame(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        })
      }
      captureSelection()
      return
    }
  }

  const block = t.closest('.image-block') as HTMLElement | null
  if (block && el.contains(block)) {
    selectImageBlock(block)
    return
  }
  clearSelectedImage()

  if (skipClearSelectionOnce.value) {
    skipClearSelectionOnce.value = false
    return
  }

  if (copyPopoverVisible.value && copyPopoverRef.value) {
    const pop = copyPopoverRef.value
    if (!(t instanceof Node && pop.contains(t))) {
      copyPopoverVisible.value = false
      copyTargetEl.value = null
    }
  }

  // 選択範囲内をクリックしたら選択を解除
  const sel = window.getSelection()
  if (sel && !sel.isCollapsed) {
    const range = sel.getRangeAt(0)
    const clickX = event.clientX
    const clickY = event.clientY
    
    // クリック位置が選択範囲内かチェック
    const rects = range.getClientRects()
    let isInsideSelection = false
    for (let i = 0; i < rects.length; i++) {
      const rect = rects[i]
      if (
        clickX >= rect.left &&
        clickX <= rect.right &&
        clickY >= rect.top &&
        clickY <= rect.bottom
      ) {
        isInsideSelection = true
        break
      }
    }
    
    if (isInsideSelection) {
      sel.removeAllRanges()
    }
  }

  captureSelection()
}

const onEditorContextMenu = (event: MouseEvent) => {
  const el = editorRef.value
  if (!el) return
  const t = event.target
  if (!(t instanceof Element)) return
  const topLevel = getTopLevelBlock(t, el)
  if (!topLevel) return
  const text = getBlockText(topLevel)
  if (!String(text || '').trim()) return
  copyTargetEl.value = topLevel
  copyPopoverVisible.value = true
  copyPopoverX.value = event.clientX + 8
  copyPopoverY.value = event.clientY + 8
}

const onCopyPopoverClick = () => {
  if (!copyTargetEl.value) return
  copyTextToClipboard(getBlockText(copyTargetEl.value))
  copyPopoverVisible.value = false
  copyTargetEl.value = null
}


const openImagePicker = () => {
  if (!isBrowser) return
  try {
    imageInputRef.value?.click()
  } catch {}
}

const readFileAsDataUrl = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('FileReader error'))
    reader.onload = () => resolve(String(reader.result || ''))
    reader.readAsDataURL(file)
  })
}

const insertImageDataUrl = (src: string, alt = '') => {
  const el = editorRef.value
  if (!el) return
  if (!src) return

  const range = restoreSelectionForCommand()
  if (!range) return

  range.deleteContents()

  const block = document.createElement('span')
  block.className = 'image-block'
  block.setAttribute('data-inline-image', 'true')
  block.setAttribute('data-image-layout', 'inline')
  ;(block as any).contentEditable = 'false'
  block.style.width = '100%'

  const handle = document.createElement('span')
  handle.className = 'image-resize-handle'
  handle.setAttribute('data-editor-only', 'true')
  ;(handle as any).contentEditable = 'false'

  const img = document.createElement('img')
  img.className = 'doc-image'
  img.src = src
  img.alt = alt
  ;(img as any).draggable = false

  block.appendChild(handle)
  block.appendChild(img)
  range.insertNode(block)

  const sel = window.getSelection()
  if (sel) {
    const after = document.createRange()
    after.setStartAfter(block)
    after.collapse(true)
    sel.removeAllRanges()
    sel.addRange(after)
    savedRange.value = after.cloneRange()
  }

  // 挿入直後は選択状態にして操作しやすく
  selectImageBlock(block)

  runAfterDomMutation()
}

const insertImageFromFile = (file: File) => {
  if (!file || !file.type || !file.type.startsWith('image/')) return

  if (file.size > INLINE_IMAGE_WARN_BYTES) {
    const ok = window.confirm(
      `画像サイズが大きいため（約${Math.round(file.size / 1024)}KB）、保存容量の都合で動作が重くなる可能性があります。挿入しますか？`
    )
    if (!ok) return
  }

  readFileAsDataUrl(file)
    .then((url) => {
      insertImageDataUrl(url, file.name || 'image')
    })
    .catch(() => {
      alert('画像の読み込みに失敗しました。')
    })
}

const onImageInputChange = (event: Event) => {
  const input = event.target as HTMLInputElement | null
  const file = input?.files && input.files.length ? input.files[0] : null
  if (input) input.value = ''
  if (!file) return
  insertImageFromFile(file)
}

const setSelectionFromPoint = (x: number, y: number) => {
  const docAny = document as any
  try {
    if (typeof docAny.caretPositionFromPoint === 'function') {
      const pos = docAny.caretPositionFromPoint(x, y)
      if (!pos) return
      const r = document.createRange()
      r.setStart(pos.offsetNode, pos.offset)
      r.collapse(true)
      const sel = window.getSelection()
      if (!sel) return
      sel.removeAllRanges()
      sel.addRange(r)
      savedRange.value = r.cloneRange()
      return
    }
    if (typeof docAny.caretRangeFromPoint === 'function') {
      const r: Range | null = docAny.caretRangeFromPoint(x, y)
      if (!r) return
      const sel = window.getSelection()
      if (!sel) return
      sel.removeAllRanges()
      sel.addRange(r)
      savedRange.value = r.cloneRange()
    }
  } catch {}
}

const onPaste = (event: ClipboardEvent) => {
  const items = event.clipboardData?.items
  if (!items) return
  const imgItem = Array.from(items).find((i) => i.type && i.type.startsWith('image/'))
  if (!imgItem) return
  const file = imgItem.getAsFile()
  if (!file) return
  event.preventDefault()
  insertImageFromFile(file)
}

const onDrop = (event: DragEvent) => {
  const files = event.dataTransfer?.files
  if (!files || !files.length) return
  const file = Array.from(files).find((f) => f.type && f.type.startsWith('image/'))
  if (!file) return
  event.preventDefault()
  if (typeof event.clientX === 'number' && typeof event.clientY === 'number') {
    setSelectionFromPoint(event.clientX, event.clientY)
  }
  insertImageFromFile(file)
}

const promptSelectedImageWidth = () => {
  const block = selectedImageBlock.value
  if (!block) return
  const rawCurrent = (block.style.width || '').trim()
  const current = rawCurrent.endsWith('%') ? rawCurrent : '100%'
  const input = window.prompt('画像の幅（%）を入力してください（例: 50）。空欄でキャンセル。', current.replace('%', ''))
  if (input == null) return
  const v = input.trim()
  if (!v) return
  const n = Number.parseInt(v, 10)
  if (!Number.isFinite(n)) {
    alert('数値を入力してください。')
    return
  }
  const clamped = Math.max(5, Math.min(100, n))
  block.style.width = `${clamped}%`
  runAfterDomMutation()
}

const deleteSelectedImage = () => {
  const block = selectedImageBlock.value
  if (!block) return
  const el = editorRef.value
  if (!el || !el.contains(block)) {
    clearSelectedImage()
    return
  }

  const parent = block.parentNode
  const next = block.nextSibling
  clearSelectedImage()

  try {
    block.remove()
  } catch {
    try {
      parent?.removeChild(block)
    } catch {}
  }

  const sel = window.getSelection()
  if (sel && parent) {
    const r = document.createRange()
    if (next) {
      r.setStartBefore(next)
    } else {
      r.selectNodeContents(parent)
      r.collapse(false)
    }
    r.collapse(true)
    sel.removeAllRanges()
    sel.addRange(r)
    savedRange.value = r.cloneRange()
  }

  runAfterDomMutation()
}

// ---- insert templates (headings/accordion)
const insertTemplate = (type: 'h1' | 'h2' | 'h3' | 'accordion') => {
  const el = editorRef.value
  if (!el) return

  const blocks = getBlocksInSelection()
  const targetBlocks = blocks.length ? blocks : [appendParagraphAtEnd()]

  const setCaretAfter = (node: Node) => {
    const selection = window.getSelection()
    if (!selection) return
    const r = document.createRange()
    r.setStartAfter(node)
    r.collapse(true)
    selection.removeAllRanges()
    selection.addRange(r)
    savedRange.value = r.cloneRange()
  }

  const replaceWithParagraph = (node: HTMLElement, html: string) => {
    const p = document.createElement('p')
    p.innerHTML = html
    node.replaceWith(p)
    setCaretAfter(p)
  }

  const toHeading = (node: HTMLElement, tag: 'h1' | 'h2' | 'h3') => {
    const currentTag = node.tagName.toLowerCase()
    if (currentTag === tag) {
      replaceWithParagraph(node, node.innerHTML)
      return
    }

    const h = document.createElement(tag)
    if (currentTag === 'details') {
      const body = (node.querySelector('.accordion-body') as HTMLElement | null)
      h.innerHTML = body ? body.innerHTML : (node.textContent || '')
    } else {
      h.innerHTML = node.innerHTML
    }

    if (!h.textContent || !h.textContent.trim()) {
      h.textContent = tag === 'h1' ? '大見出しタイトル' : tag === 'h2' ? '中見出しタイトル' : '小見出しタイトル'
    }

    node.replaceWith(h)
    setCaretAfter(h)
  }

  const toAccordion = (node: HTMLElement) => {
    const currentTag = node.tagName.toLowerCase()
    if (currentTag === 'details' && node.classList.contains('accordion')) {
      const summary = (node.querySelector('summary') as HTMLElement | null)?.textContent || ''
      const bodyHtml = (node.querySelector('.accordion-body') as HTMLElement | null)?.innerHTML || ''
      const html = [summary ? `<strong>${escapeHtml(summary)}</strong>` : '', bodyHtml].filter(Boolean).join('<br>')
      replaceWithParagraph(node, html)
      return
    }

    const details = document.createElement('details')
    details.className = 'accordion'
    details.open = true
    try {
      details.setAttribute('data-accordion-style', accordionDefaultStyle.value)
    } catch {}

    const summary = document.createElement('summary')
    summary.textContent = 'アコーディオンのタイトル'

    const body = document.createElement('div')
    body.className = 'accordion-body'
    body.innerHTML = node.innerHTML
    if (!body.innerHTML.trim()) body.textContent = 'ここにアコーディオンの中身を入力してください。'

    details.appendChild(summary)
    details.appendChild(body)
    node.replaceWith(details)
    setCaretAfter(details)
  }

  // 複数ブロック選択時は、1つのアコーディオンにまとめる
  if (type === 'accordion' && targetBlocks.length > 1) {
    const first = targetBlocks[0]
    if (!first) return

    const details = document.createElement('details')
    details.className = 'accordion'
    details.open = true
    try {
      details.setAttribute('data-accordion-style', accordionDefaultStyle.value)
    } catch {}

    const summary = document.createElement('summary')
    summary.textContent = 'アコーディオンのタイトル'
    details.appendChild(summary)

    const getBodyHtml = (node: HTMLElement) => {
      const currentTag = node.tagName.toLowerCase()
      if (currentTag === 'details' && node.classList.contains('accordion')) {
        const s = (node.querySelector('summary') as HTMLElement | null)?.textContent || ''
        const bodyHtml = (node.querySelector('.accordion-body') as HTMLElement | null)?.innerHTML || ''
        return [s ? `<strong>${escapeHtml(s)}</strong>` : '', bodyHtml].filter(Boolean).join('<br>')
      }
      return node.innerHTML
    }

    targetBlocks.forEach((b) => {
      const body = document.createElement('div')
      body.className = 'accordion-body'
      body.innerHTML = getBodyHtml(b)
      if (!body.innerHTML.trim()) body.textContent = 'ここにアコーディオンの中身を入力してください。'
      details.appendChild(body)
    })

    first.replaceWith(details)
    targetBlocks.slice(1).forEach((b) => {
      try {
        b.remove()
      } catch {}
    })

    setCaretAfter(details)
  } else {
    targetBlocks.forEach((b) => {
      if (type === 'accordion') toAccordion(b)
      else toHeading(b, type)
    })
  }

  runAfterDomMutation()
}

const appendParagraphAtEnd = (): HTMLElement => {
  const el = editorRef.value
  if (!el) {
    const dummy = document.createElement('p')
    dummy.textContent = ''
    return dummy
  }

  const tail = el.querySelector('p[data-empty-tail="true"]')
  const p = document.createElement('p')
  p.innerHTML = 'ここに本文を入力してください。'
  if (tail && tail.parentNode) {
    tail.parentNode.insertBefore(p, tail)
  } else {
    el.appendChild(p)
  }
  return p
}

function escapeHtml (s: string) {
  return (s || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

// ---- variable token insertion
const insertVariableToken = (token: string) => {
  const el = editorRef.value
  if (!el) return

  const range = restoreSelectionForCommand()
  if (!range) return

  range.deleteContents()
  range.insertNode(document.createTextNode(token))

  const selection = window.getSelection()
  if (selection) {
    const after = document.createRange()
    after.setStart(range.endContainer, range.endOffset)
    after.collapse(true)
    selection.removeAllRanges()
    selection.addRange(after)
    savedRange.value = after.cloneRange()
  }

  runAfterDomMutation()
}

const insertCharacterToken = (ch: Character) => {
  const el = editorRef.value
  if (!el) return

  const key = String(ch?.key || '')
  if (!key) return

  const range = restoreSelectionForCommand()
  if (!range) return

  range.deleteContents()

  const span = document.createElement('span')
  span.className = 'char-token'
  span.dataset.charKey = key
  span.dataset.wrapped = isWrappedForKey(key) ? 'true' : 'false'
  span.contentEditable = 'false'
  span.textContent = getCharacterName(key)
  applyCharacterStylesToToken(span, key)

  range.insertNode(span)

  const selection = window.getSelection()
  if (selection) {
    const after = document.createRange()
    after.setStartAfter(span)
    after.collapse(true)
    selection.removeAllRanges()
    selection.addRange(after)
    savedRange.value = after.cloneRange()
  }

  runAfterDomMutation()
}

// ---- speech insertion
const insertSpeech = (ch: Character) => {
  const el = editorRef.value
  if (!el) return

  const range = restoreSelectionForCommand()
  if (!range) return

  const span = document.createElement('span')
  span.className = 'char-speech'
  if (ch?.key) span.dataset.charKey = String(ch.key)

  const key = ch?.key ? String(ch.key) : ''
  if (key) applyCharacterStylesToSpeech(span, key)

  const selection = window.getSelection()
  const isCollapsed = range.collapsed

  if (!isCollapsed) {
    const frag = range.extractContents()
    const open = document.createTextNode('「')
    const close = document.createTextNode('」')
    span.appendChild(open)
    span.appendChild(frag)
    span.appendChild(close)
    range.insertNode(span)

    if (selection) {
      const caret = document.createRange()
      caret.setStart(close, 0)
      caret.collapse(true)
      selection.removeAllRanges()
      selection.addRange(caret)
      savedRange.value = caret.cloneRange()
    }

    runAfterDomMutation()
    return
  }

  range.deleteContents()
  const tn = document.createTextNode('「\u200b」')
  span.appendChild(tn)
  range.insertNode(span)

  if (selection) {
    const caret = document.createRange()
    caret.setStart(tn, 1)
    caret.collapse(true)
    selection.removeAllRanges()
    selection.addRange(caret)
    savedRange.value = caret.cloneRange()
  }

  runAfterDomMutation()
}

const replaceCharacterWithPlainText = (keyRaw: string, nameRaw?: string) => {
  const el = editorRef.value
  if (!el) return

  const key = String(keyRaw || '').trim()
  if (!key) return

  const replacementName = String(nameRaw || '').trim() || getCharacterName(key)
  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const tokenRe = new RegExp(`{{\\s*${escapeRegExp(key)}\\s*}}`, 'g')

  // char-token -> character name text
  try {
    const q = `span.char-token[data-char-key="${CSS.escape(key)}"]`
    const spans = Array.from(el.querySelectorAll(q)) as HTMLElement[]
    spans.forEach((s) => {
      try { s.replaceWith(document.createTextNode(replacementName)) } catch {}
    })
  } catch {}

  // char-speech -> plain text (keep quotes)
  try {
    const q = `span.char-speech[data-char-key="${CSS.escape(key)}"]`
    const spans = Array.from(el.querySelectorAll(q)) as HTMLElement[]
    spans.forEach((s) => {
      const t = s.textContent || ''
      try { s.replaceWith(document.createTextNode(t)) } catch {}
    })
  } catch {}

  // raw {{key}} tokens (if any) -> character name text
  try {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
    const textNodes: Text[] = []
    while (walker.nextNode()) {
      const n = walker.currentNode
      if (n && n.nodeType === Node.TEXT_NODE) textNodes.push(n as Text)
    }

    textNodes.forEach((tn) => {
      const text = tn.nodeValue || ''
      if (!tokenRe.test(text)) return
      tokenRe.lastIndex = 0
      tn.nodeValue = text.replace(tokenRe, replacementName)
    })
  } catch {}

  runAfterDomMutation()
}

// ---- input + key handling
const isCharTokenEl = (node: Node | null): HTMLSpanElement | null => {
  if (!node) return null
  if (node.nodeType !== Node.ELEMENT_NODE) return null
  const el = node as Element
  if (!(el instanceof HTMLSpanElement)) return null
  if (!el.classList.contains('char-token')) return null
  return el
}

const onKeydown = (event: KeyboardEvent) => {
  // IME変換中はDOM整形が候補位置を壊しやすいので、最小限にする
  if (isComposing.value || (event as any).isComposing) {
    return
  }

  if ((event.ctrlKey || event.metaKey) && !event.shiftKey && (event.key === 'z' || event.key === 'Z')) {
    event.preventDefault()
    undo()
    return
  }

  if ((event.ctrlKey || event.metaKey) && !event.shiftKey && (event.key === 'y' || event.key === 'Y')) {
    event.preventDefault()
    redo()
    return
  }

  const el = editorRef.value
  if (!el) return

  // 画像が選択状態のときは Backspace/Delete で削除
  if ((event.key === 'Backspace' || event.key === 'Delete') && selectedImageBlock.value) {
    event.preventDefault()
    deleteSelectedImage()
    return
  }

  // accordion-body 先頭での Backspace は、前の body へ安全に結合する
  if (event.key === 'Backspace') {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0)
      if (el.contains(range.commonAncestorContainer) && range.collapsed) {
        const base = (range.startContainer.nodeType === Node.TEXT_NODE
          ? (range.startContainer.parentElement || null)
          : (range.startContainer as Element | null))

        const body = base?.closest?.('.accordion-body') as HTMLElement | null
        if (body) {
          let atStart = false
          try {
            const pre = document.createRange()
            pre.setStart(body, 0)
            pre.setEnd(range.startContainer, range.startOffset)
            const text = (pre.toString() || '').replace(/\u200b/g, '').trim()
            const frag = pre.cloneContents()
            const hasElements = Array.from(frag.childNodes).some((n) => n.nodeType === Node.ELEMENT_NODE)
            atStart = text.length === 0 && !hasElements
          } catch {
            atStart = false
          }

          const prev = body.previousElementSibling as HTMLElement | null
          const prevBody = prev && prev.classList.contains('accordion-body') ? prev : null
          if (atStart && prevBody) {
            event.preventDefault()

            // caret marker
            const marker = document.createTextNode('\u200b')
            try {
              range.insertNode(marker)
            } catch {
              // marker が入れられない場合は中断
              try { marker.remove() } catch {}
              return
            }

            const isBr = (n: ChildNode | null) => {
              return !!(n && n.nodeType === Node.ELEMENT_NODE && (n as Element).tagName === 'BR')
            }

            // 前の body が <br> で終わっていなければ入れて区切る
            if (prevBody.childNodes.length > 0 && !isBr(prevBody.lastChild)) {
              prevBody.appendChild(document.createElement('br'))
            }

            // 先頭の <br> は二重になりやすいので調整
            while (isBr(body.firstChild) && isBr(prevBody.lastChild)) {
              try {
                body.firstChild?.remove()
              } catch {
                break
              }
            }

            // body の中身を前へ移動
            while (body.firstChild) {
              prevBody.appendChild(body.firstChild)
            }

            // 空になった body は削除
            try {
              body.remove()
            } catch {}

            // caret を marker 位置へ戻す
            const nextRange = document.createRange()
            nextRange.setStartBefore(marker)
            nextRange.collapse(true)
            sel.removeAllRanges()
            sel.addRange(nextRange)
            savedRange.value = nextRange.cloneRange()
            try {
              marker.remove()
            } catch {}

            runAfterDomMutation()
            return
          }
        }

        // p 先頭での Backspace は、前の p へ安全に結合する
        const p = base?.closest?.('p') as HTMLParagraphElement | null
        const isTail = (node: Element | null) => {
          return !!(node && node.tagName === 'P' && (node as any).dataset?.emptyTail === 'true')
        }
        if (p && !isTail(p)) {
          let atStartOfP = false
          try {
            const pre = document.createRange()
            pre.setStart(p, 0)
            pre.setEnd(range.startContainer, range.startOffset)
            const text = (pre.toString() || '').replace(/\u200b/g, '').trim()
            const frag = pre.cloneContents()
            const hasElements = Array.from(frag.childNodes).some((n) => n.nodeType === Node.ELEMENT_NODE)
            atStartOfP = text.length === 0 && !hasElements
          } catch {
            atStartOfP = false
          }

          const prevEl = p.previousElementSibling as HTMLElement | null
          const prevP = prevEl && prevEl.tagName === 'P' && !isTail(prevEl) ? (prevEl as HTMLParagraphElement) : null
          if (atStartOfP && prevP) {
            event.preventDefault()

            const marker = document.createTextNode('\u200b')
            try {
              range.insertNode(marker)
            } catch {
              try { marker.remove() } catch {}
              return
            }

            const isBr = (n: ChildNode | null) => {
              return !!(n && n.nodeType === Node.ELEMENT_NODE && (n as Element).tagName === 'BR')
            }

            if (prevP.childNodes.length > 0 && !isBr(prevP.lastChild)) {
              prevP.appendChild(document.createElement('br'))
            }

            while (isBr(p.firstChild) && isBr(prevP.lastChild)) {
              try {
                p.firstChild?.remove()
              } catch {
                break
              }
            }

            while (p.firstChild) {
              prevP.appendChild(p.firstChild)
            }

            try {
              p.remove()
            } catch {}

            const nextRange = document.createRange()
            nextRange.setStartBefore(marker)
            nextRange.collapse(true)
            sel.removeAllRanges()
            sel.addRange(nextRange)
            savedRange.value = nextRange.cloneRange()
            try {
              marker.remove()
            } catch {}

            runAfterDomMutation()
            return
          }
        }
      }
    }
  }

  if (event.key === 'Backspace' || event.key === 'Delete') {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0)
      if (el.contains(range.commonAncestorContainer) && range.collapsed) {
        let tokenEl: HTMLSpanElement | null = null
        const container = range.startContainer
        const offset = range.startOffset

        if (container.nodeType === Node.TEXT_NODE) {
          const textNode = container as Text
          const textLen = textNode.data.length
          if (event.key === 'Backspace' && offset === 0) tokenEl = isCharTokenEl(textNode.previousSibling)
          if (event.key === 'Delete' && offset === textLen) tokenEl = isCharTokenEl(textNode.nextSibling)
        } else if (container.nodeType === Node.ELEMENT_NODE) {
          const element = container as Element
          if (event.key === 'Backspace' && offset > 0) tokenEl = isCharTokenEl(element.childNodes[offset - 1] || null)
          if (event.key === 'Delete') tokenEl = isCharTokenEl(element.childNodes[offset] || null)
        }

        if (!tokenEl && container.nodeType === Node.ELEMENT_NODE) {
          const element = container as Element
          const host = element.closest('span.char-token') as HTMLSpanElement | null
          if (host && el.contains(host)) tokenEl = host
        }

        if (tokenEl && el.contains(tokenEl)) {
          event.preventDefault()

          const focusParent = tokenEl.parentNode
          const next = tokenEl.nextSibling
          tokenEl.remove()

          const newRange = document.createRange()
          if (next) {
            newRange.setStartBefore(next)
          } else if (focusParent) {
            newRange.selectNodeContents(focusParent)
            newRange.collapse(false)
          } else {
            newRange.selectNodeContents(el)
            newRange.collapse(false)
          }
          newRange.collapse(true)
          sel.removeAllRanges()
          sel.addRange(newRange)
          savedRange.value = newRange.cloneRange()

          normalizeEmptyTail()
          appendEmptyTailIfNeeded()
          syncFromDom()
          pushHistoryFromDom()
          captureSelection()
          updateTocFromDom()
          return
        }
      }
    }

    const tail = el.querySelector('p[data-empty-tail="true"]')
    if (tail) {
      const children = Array.from(el.children)
      if (children.length === 1 && children[0] === tail) {
        // 空tailしか無い状態でも入力できるようにしつつ、tail自体の削除だけは防ぐ
        if (event.key === 'Backspace' || event.key === 'Delete') {
          event.preventDefault()
        }
      }
    }
  }
}

const onCompositionStart = () => {
  isComposing.value = true
  pendingAfterCompositionEnd = false
  hideLinkChip()
}

const onCompositionEnd = () => {
  isComposing.value = false
  // compositionend の瞬間にDOMを触ると、確定文字のコミット先が壊れて
  // 「文章が消える」「候補が左上に飛ぶ」原因になるので、次の input に任せる。
  pendingAfterCompositionEnd = true

  // 保険: input が来ない環境でも、次フレームで同期だけは行う
  window.setTimeout(() => {
    if (isComposing.value) return
    if (!pendingAfterCompositionEnd) return
    pendingAfterCompositionEnd = false
    runAfterDomMutation()
  }, 0)
}

const onInput = () => {
  // IME変換中にDOMを大きく書き換えると、候補ウィンドウが左上に飛ぶことがある
  if (isComposing.value) {
    return
  }

  if (pendingAfterCompositionEnd) {
    pendingAfterCompositionEnd = false
  }

  // DOM上から消えていたら選択解除
  if (selectedImageBlock.value) {
    const el = editorRef.value
    if (!el || !el.contains(selectedImageBlock.value)) clearSelectedImage()
  }
  normalizeEmptyTail()
  appendEmptyTailIfNeeded()
  syncFromDom()
  pushHistoryFromDom()
  renderCharacterTokens()
  captureSelection()
  updateTocFromDom()
}

const runAfterDomMutation = () => {
  if (selectedImageBlock.value) {
    const el = editorRef.value
    if (!el || !el.contains(selectedImageBlock.value)) clearSelectedImage()
  }
  normalizeEmptyTail()
  appendEmptyTailIfNeeded()
  syncFromDom()
  pushHistoryFromDom()
  renderCharacterTokens()
  captureSelection()
  updateTocFromDom()
}

// ---- export
const buildHtmlDocument = (title?: string) => {
  return buildExportHtmlDocument({
    renderedHtml: props.renderedHtml || '',
    characters: (props.characters || []) as unknown as Character[],
    title: String(title || '').trim() || 'エクスポートされたドキュメント',
    accordionInitiallyOpen: false,
    documentStyle: {
      themeAccent: themeAccent.value,
      docBg: docBg.value,
      docFont: baseDocFont,
      twoColumnWidthPercent: twoColumnWidthPercent.value,
      accordionDefaultStyle: accordionDefaultStyle.value,
      headingH1: headingStyleH1.value,
      headingH2: headingStyleH2.value,
      headingH3: headingStyleH3.value,

      headingFontH1: headingFontH1.value,
      headingFontH2: headingFontH2.value,
      headingFontH3: headingFontH3.value,

      headingAccentH1: headingAccentH1.value,
      headingAccentH2: headingAccentH2.value,
      headingAccentH3: headingAccentH3.value,

      headingTextH1: headingTextH1.value,
      headingTextH2: headingTextH2.value,
      headingTextH3: headingTextH3.value,

      headingBgH1: headingBgH1.value,
      headingBgH2: headingBgH2.value,
      headingBgH3: headingBgH3.value
    }
  })
}

const downloadHtml = (fileBaseName?: string) => {
  const base = sanitizeFileBaseName(fileBaseName, 'document')
  const html = buildHtmlDocument(base)
  downloadText(html, `${base}.html`, 'text/html')
}

const downloadJson = (fileBaseName?: string) => {
  const jsonData = buildJsonExportFromRenderedHtml(props.renderedHtml || '')
  const text = JSON.stringify(jsonData, null, 2)
  const base = sanitizeFileBaseName(fileBaseName, 'document')
  downloadText(text, `${base}.json`, 'application/json')
}

const buildPlainTextFromRenderedHtml = (renderedHtml: string): string => {
  if (!renderedHtml) return ''

  const resolveCharacterNamesForText = (html: string) => {
    if (!html) return html

    const labelForKey = (keyRaw: string) => {
      const key = String(keyRaw || '').trim()
      if (!key) return ''
      const name = getCharacterName(key)
      return isWrappedForKey(key) ? `{{${name}}}` : name
    }

    // raw {{key}} / {{ key }} -> name
    let out = html.replace(/{{\s*([^}]+?)\s*}}/g, (_m, keyRaw) => {
      const label = labelForKey(String(keyRaw || ''))
      return label || ''
    })

    // char-token が残っているケースも念のため同期
    try {
      const doc = new DOMParser().parseFromString(`<div id="__root">${out}</div>`, 'text/html')
      const root = doc.getElementById('__root')
      if (!root) return out
      const spans = Array.from(root.querySelectorAll('span.char-token[data-char-key]')) as HTMLElement[]
      spans.forEach((s) => {
        const key = String(s.getAttribute('data-char-key') || '').trim()
        if (!key) return
        s.textContent = labelForKey(key)
      })
      return root.innerHTML
    } catch {
      return out
    }
  }

  const resolvedHtml = resolveCharacterNamesForText(renderedHtml)

  const normBlock = (s: string) => {
    const v = String(s || '').replace(/\r\n/g, '\n')
    const collapsed = v.replace(/[ \t]+/g, ' ')
    const lines = collapsed
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => !!line)
    return lines.join('\n')
  }

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(`<div id="__root">${resolvedHtml}</div>`, 'text/html')
    const root = doc.getElementById('__root')
    if (!root) return ''

    const blocks: string[] = []
    const push = (raw: string) => {
      const t = normBlock(raw)
      if (!t) return
      blocks.push(t)
    }

    const children = Array.from(root.children) as HTMLElement[]
    // 出力は逐次組み立て：H1（大見出し）の直前のみ空白行を入れる
    let out = ''
    children.forEach((el) => {
      const tag = (el.tagName || '').toLowerCase()
      let text = ''
      if (tag === 'details' && el.classList.contains('accordion')) {
        const summary = normBlock(el.querySelector('summary')?.textContent || '')
        const body = normBlock(el.querySelector('.accordion-body')?.textContent || '')
        text = summary && body ? `${summary}\n${body}` : (summary || body)
      } else {
        text = normBlock(el.textContent || '')
      }
      if (!text) return
      if (out.length) {
        if (tag === 'h1') out += '\n\n'
        else out += '\n'
      }
      out += text
    })

    return out.trim() + (out ? '\n' : '')
  } catch {
    const fallback = normBlock(resolvedHtml)
    return fallback ? `${fallback}\n` : ''
  }
}

const downloadTxt = (fileBaseName?: string) => {
  const text = buildPlainTextFromRenderedHtml(props.renderedHtml || '')
  const base = sanitizeFileBaseName(fileBaseName, 'document')
  downloadText(text, `${base}.txt`, 'text/plain')
}

const downloadPdf = (fileBaseName?: string, tocItems?: TocItem[]) => {
  if (!window.jspdf) {
    alert('PDFライブラリ(jsPDF)の読み込みに失敗しました。')
    return
  }
  if (!window.html2canvas) {
    alert('html2canvasの読み込みに失敗しました。')
    return
  }

  const { jsPDF } = window.jspdf

  const a4 = { width: 595.28, height: 841.89 }
  // ユーザー指定: PDF余白（ページサイズ比）
  // - 横(左右): 10%
  // - 縦(上下): 5%
  const marginX = a4.width * 0.1
  const marginY = a4.height * 0.05
  const base = sanitizeFileBaseName(fileBaseName, 'document')
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' })

  const toc = Array.isArray(tocItems) ? tocItems : []

  const headingIndexById = new Map<string, number>()
  type PdfLinkAnno = {
    pageNumber: number
    x: number
    y: number
    w: number
    h: number
    href: string
  }
  const bodyLinkAnnos: PdfLinkAnno[] = []

  const measureTopInRoot = (root: HTMLElement, el: HTMLElement) => {
    const rootRect = root.getBoundingClientRect()
    const rect = el.getBoundingClientRect()
    return {
      top: rect.top - rootRect.top,
      left: rect.left - rootRect.left,
      width: rect.width,
      height: rect.height
    }
  }

  const addCanvasAsPages = (canvas: HTMLCanvasElement) => {
    const maxWidth = a4.width - marginX * 2
    const maxHeight = a4.height - marginY * 2

    const imgWidth = canvas.width
    const imgHeight = canvas.height
    if (imgWidth <= 0 || imgHeight <= 0) return

    // 幅は必ずフィットさせ、縦が長い場合はページ分割する
    const ratio = maxWidth / imgWidth
    const renderWidth = imgWidth * ratio
    const offsetX = (a4.width - renderWidth) / 2
    const offsetY = marginY

    const sliceHeightPx = Math.floor(maxHeight / ratio)
    if (!Number.isFinite(sliceHeightPx) || sliceHeightPx <= 0) return

    let yPx = 0
    let page = 0
    while (yPx < imgHeight) {
      const remaining = imgHeight - yPx
      const thisSlicePx = Math.min(sliceHeightPx, remaining)

      const sliceCanvas = document.createElement('canvas')
      sliceCanvas.width = imgWidth
      sliceCanvas.height = thisSlicePx
      const ctx = sliceCanvas.getContext('2d')
      if (!ctx) break

      ctx.drawImage(canvas, 0, yPx, imgWidth, thisSlicePx, 0, 0, imgWidth, thisSlicePx)
      const imgData = sliceCanvas.toDataURL('image/png')

      const renderHeight = thisSlicePx * ratio
      if (page > 0) pdf.addPage()
      
      // ページ背景色を設定
      try {
        const bg = docBg.value || '#ffffff'
        const hex = bg.replace('#', '')
        const r = parseInt(hex.substring(0, 2), 16)
        const g = parseInt(hex.substring(2, 4), 16)
        const b = parseInt(hex.substring(4, 6), 16)
        pdf.setFillColor(r, g, b)
        pdf.rect(0, 0, a4.width, a4.height, 'F')
      } catch {}
      
      pdf.addImage(imgData, 'PNG', offsetX, offsetY, renderWidth, renderHeight)

      yPx += thisSlicePx
      page += 1
    }
  }

  const getCanvasPaging = (canvas: HTMLCanvasElement) => {
    const maxWidth = a4.width - marginX * 2
    const maxHeight = a4.height - marginY * 2

    const imgWidth = canvas.width
    const imgHeight = canvas.height
    if (imgWidth <= 0 || imgHeight <= 0) {
      return { ratio: 1, sliceHeightPx: 0, imgHeight: 0, imgWidth: 0 }
    }

    const ratio = maxWidth / imgWidth
    const sliceHeightPx = Math.floor(maxHeight / ratio)
    return { ratio, sliceHeightPx, imgHeight, imgWidth }
  }

  const createTocRoot = (items: TocItem[]) => {
    const root = document.createElement('div')
    root.className = 'doc-frame'
    root.style.position = 'fixed'
    root.style.left = '-100000px'
    root.style.top = '0'
    root.style.width = '794px'
    root.style.background = '#ffffff'
    root.style.border = 'none'
    root.style.borderRadius = '0'
    root.style.boxShadow = 'none'
    root.style.padding = '24px'
    root.style.boxSizing = 'border-box'
    root.style.color = '#111827'
    root.style.fontFamily = 'system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans JP", "Hiragino Sans", "Yu Gothic", sans-serif'

    const title = document.createElement('div')
    title.textContent = '目次'
    title.style.fontSize = '22px'
    title.style.fontWeight = '700'
    title.style.margin = '0 0 14px 0'
    root.appendChild(title)

    const list = document.createElement('div')
    list.style.lineHeight = '1.35'

    const indentByLevel: Record<number, number> = { 2: 18, 3: 36 }
    const fontSizeByLevel: Record<number, string> = { 1: '20px', 2: '18px', 3: '16px' }

    items.forEach((item) => {
      const row = document.createElement('div')
      row.dataset.tocIndex = String((item as any)?.index ?? '')
      const level = (item as any)?.level
      row.style.paddingLeft = `${indentByLevel[level] ?? 0}px`
      row.style.margin = '8px 0'
      row.style.fontSize = fontSizeByLevel[level] ?? '16px'
      row.textContent = String((item as any)?.text || '').trim() || '（無題）'
      list.appendChild(row)
    })

    root.appendChild(list)
    return root
  }

  const printRoot = document.createElement('div')
  printRoot.className = 'doc-frame'
  printRoot.setAttribute('data-doc-font', baseDocFont)
  printRoot.setAttribute('data-heading-h1', headingStyleH1.value)
  printRoot.setAttribute('data-heading-h2', headingStyleH2.value)
  printRoot.setAttribute('data-heading-h3', headingStyleH3.value)
  applyHeadingVarsToElement(printRoot)
  printRoot.style.position = 'fixed'
  printRoot.style.left = '-100000px'
  printRoot.style.top = '0'
  printRoot.style.width = '794px'
  printRoot.style.background = docBg.value
  printRoot.style.padding = '0'
  printRoot.style.margin = '0'
  printRoot.style.boxSizing = 'border-box'
  printRoot.style.border = 'none'
  printRoot.style.borderRadius = '0'
  printRoot.style.boxShadow = 'none'

  const resolved = resolveCharacterNamesPlainInHtml(props.renderedHtml)
  printRoot.innerHTML = resolved

  // PDFにはエディタ用の操作UIを含めない
  try {
    printRoot.querySelectorAll('.image-resize-handle,[data-editor-only="true"]').forEach((n) => n.remove())
  } catch {}
  try {
    printRoot.querySelectorAll('.image-block.is-selected').forEach((b) => (b as HTMLElement).classList.remove('is-selected'))
  } catch {}

  const details = printRoot.querySelectorAll('details.accordion')
  details.forEach((d) => {
    try {
      ;(d as HTMLDetailsElement).open = true
      d.setAttribute('open', '')
    } catch {}
  })

  const tocRoot = toc.length ? createTocRoot(toc) : null
  if (tocRoot) {
    try {
      tocRoot.setAttribute('data-doc-font', baseDocFont)
      tocRoot.setAttribute('data-heading-h1', headingStyleH1.value)
      tocRoot.setAttribute('data-heading-h2', headingStyleH2.value)
      tocRoot.setAttribute('data-heading-h3', headingStyleH3.value)
      applyHeadingVarsToElement(tocRoot)
      // 背景色と文字色を適用
      tocRoot.style.backgroundColor = docBg.value
      tocRoot.style.color = docTextColor.value
    } catch {}
  }

  const cleanup = () => {
    try {
      printRoot.remove()
    } catch {}
    try {
      tocRoot?.remove()
    } catch {}
  }

  document.body.appendChild(printRoot)
  if (tocRoot) document.body.appendChild(tocRoot)

  // 本文側の見出し位置（CSS px）を測っておく（TocItem.index と同じ順）
  const headingTopByIndex = new Map<number, number>()
  try {
    const rootRect = printRoot.getBoundingClientRect()
    const headings = Array.from(printRoot.querySelectorAll('h1, h2, h3')) as HTMLElement[]
    headings.forEach((h, index) => {
      const r = h.getBoundingClientRect()
      const top = r.top - rootRect.top
      headingTopByIndex.set(index, top)
    })
  } catch {}

  // 目次リンク用に、見出しに連番を付けておく
  try {
    const headings = Array.from(printRoot.querySelectorAll('h1, h2, h3')) as HTMLElement[]
    ensureHeadingAnchorIds(headings)
    headings.forEach((h, index) => {
      h.setAttribute('data-heading-index', String(index))
      const id = String(h.getAttribute('id') || '').trim()
      if (id) headingIndexById.set(id, index)
    })
  } catch {}

  // 目次側の各行位置（CSS px）を測っておく（canvas化後にPDF座標へ変換してリンクを重ねる）
  const tocRowBoxes: Array<{ index: number; top: number; height: number }> = []
  if (tocRoot) {
    try {
      const rows = Array.from(tocRoot.querySelectorAll('[data-toc-index]')) as HTMLElement[]
      rows.forEach((row) => {
        const raw = row.dataset.tocIndex
        const idx = Number.parseInt(String(raw ?? ''), 10)
        if (!Number.isFinite(idx) || idx < 0) return
        const box = measureTopInRoot(tocRoot, row)
        tocRowBoxes.push({ index: idx, top: box.top, height: box.height })
      })
    } catch {}
  }

  const computeSafeRenderScale = (roots: Array<HTMLElement | null>, baseScale = 2) => {
    let maxPixels = 0
    roots.forEach((root) => {
      if (!root) return
      try {
        const imgs = Array.from(root.querySelectorAll('img')) as HTMLImageElement[]
        imgs.forEach((img) => {
          const w = img.naturalWidth || img.width || 0
          const h = img.naturalHeight || img.height || 0
          if (w > 0 && h > 0) maxPixels = Math.max(maxPixels, w * h)
        })
      } catch {}
    })

    if (maxPixels >= 12_000_000) return 0.75
    if (maxPixels >= 6_000_000) return 1
    return baseScale
  }

  const renderScale = computeSafeRenderScale([printRoot, tocRoot], 2)

  const renderOptions = {
    scale: renderScale,
    useCORS: true,
    allowTaint: true,
    scrollX: 0,
    scrollY: 0,
    backgroundColor: docBg.value,
    imageTimeout: 15000
  }

  const applyCanvasFriendlyTextDecorations = (root: HTMLElement) => {
    try {
      const els = Array.from(root.querySelectorAll('u,s,strike,del,span,font')) as HTMLElement[]
      els.forEach((el) => {
        if (!el || (el as any).dataset?.canvasDecoDone === '1') return

        let computed: CSSStyleDeclaration | null = null
        try {
          computed = window.getComputedStyle(el)
        } catch {
          computed = null
        }

        const tag = String((el as any).tagName || '').toUpperCase()
        const line = String((computed as any)?.textDecorationLine || (computed as any)?.textDecoration || '')
        const hasUnderline = tag === 'U' || line.includes('underline')
        const hasStrike = tag === 'S' || tag === 'DEL' || tag === 'STRIKE' || line.includes('line-through')
        if (!hasUnderline && !hasStrike) return

        const color = String((computed as any)?.color || el.style.color || '#111827')

        try {
          el.style.textDecoration = 'none'
        } catch {}

        // できるだけ html2canvas が取りこぼしにくい表現へ寄せる
        if (hasUnderline) {
          try {
            el.style.borderBottom = `1px solid ${color}`
            el.style.paddingBottom = '0.06em'
            ;(el.style as any).boxDecorationBreak = 'clone'
            ;(el.style as any).webkitBoxDecorationBreak = 'clone'
          } catch {}
        }
        if (hasStrike) {
          try {
            el.style.backgroundImage = `linear-gradient(${color}, ${color})`
            el.style.backgroundRepeat = 'no-repeat'
            el.style.backgroundSize = '100% 1px'
            el.style.backgroundPosition = '0 58%'
          } catch {}
        }

        try {
          ;(el as any).dataset.canvasDecoDone = '1'
        } catch {}
      })
    } catch {}
    try {
      const styled = Array.from(root.querySelectorAll('span[data-text-style]')) as HTMLElement[]
      styled.forEach((el) => {
        if (!el || (el as any).dataset?.canvasDecoDone === '1') return
        const styleName = String(el.getAttribute('data-text-style') || '')
        let computed: CSSStyleDeclaration | null = null
        try { computed = window.getComputedStyle(el) } catch { computed = null }
        const color = String((computed as any)?.color || el.style.color || '#111827')
        const bg = String((computed as any)?.backgroundColor || el.style.backgroundColor || '')
        try {
          // remove pseudo-dependent decorations
          // map common styles to inline styles html2canvas reliably renders
          if (styleName.startsWith('underline')) {
            el.style.textDecoration = 'none'
            el.style.borderBottom = '1px solid ' + color
            el.style.paddingBottom = '0.06em'
          } else if (styleName.startsWith('box')) {
            el.style.border = '1px solid ' + color
            el.style.padding = '0 6px'
            el.style.borderRadius = '6px'
            if (bg) el.style.backgroundColor = bg
          } else if (styleName === 'leftbar') {
            el.style.borderLeft = '4px solid ' + color
            el.style.paddingLeft = '8px'
          } else if (styleName === 'line-accent') {
            el.style.position = 'relative'
            // fallback: add thin bottom border
            el.style.borderBottom = '2px solid ' + color
            el.style.paddingBottom = '0.06em'
          } else if (styleName === 'side-lines') {
            // approximate with top and bottom borders
            el.style.borderTop = '1px solid ' + color
            el.style.borderBottom = '1px solid ' + color
            el.style.padding = '0 6px'
          }
        } catch {}
        try { ;(el as any).dataset.canvasDecoDone = '1' } catch {}
      })
    } catch {}
  }

  const applyPdfOverflowGuards = (root: HTMLElement) => {
    try {
      root.style.overflowWrap = 'anywhere'
      ;(root.style as any).wordBreak = 'break-word'
    } catch {}

    try {
      const imgs = Array.from(root.querySelectorAll('img')) as HTMLImageElement[]
      imgs.forEach((img) => {
        try {
          img.style.maxWidth = '100%'
          img.style.height = 'auto'
        } catch {}
      })
    } catch {}

    try {
      const pres = Array.from(root.querySelectorAll('pre, code')) as HTMLElement[]
      pres.forEach((el) => {
        try {
          el.style.whiteSpace = 'pre-wrap'
          el.style.overflowWrap = 'anywhere'
          ;(el.style as any).wordBreak = 'break-word'
        } catch {}
      })
    } catch {}

    try {
      const blocks = Array.from(root.querySelectorAll('.image-block')) as HTMLElement[]
      blocks.forEach((el) => {
        try {
          el.style.background = 'transparent'
          el.style.boxShadow = 'none'
          el.style.border = 'none'
        } catch {}
      })
    } catch {}

    // 2段組がはみ出すのを抑える（flex itemのmin-width由来）
    try {
      const cols = Array.from(root.querySelectorAll('.two-col-block, .two-col-col')) as HTMLElement[]
      cols.forEach((el) => {
        try {
          el.style.minWidth = '0'
        } catch {}
      })
    } catch {}
  }

  const scale = (renderOptions as any).scale || 1

  const setImageSrcAndWait = (img: HTMLImageElement, src: string) => {
    return new Promise<void>((resolve) => {
      let done = false
      const finish = () => {
        if (done) return
        done = true
        try {
          img.removeEventListener('load', onLoad)
          img.removeEventListener('error', onError)
        } catch {}
        resolve()
      }
      const onLoad = () => finish()
      const onError = () => finish()

      try {
        img.addEventListener('load', onLoad)
        img.addEventListener('error', onError)
      } catch {}

      try {
        ;(img as any).decoding = 'sync'
        ;(img as any).loading = 'eager'
      } catch {}

      img.src = src

      try {
        const anyImg = img as any
        if (typeof anyImg.decode === 'function') {
          anyImg.decode().then(() => finish()).catch(() => {})
        }
      } catch {}

      window.setTimeout(() => finish(), 2000)
    })
  }

  const compressImageForPdf = async (img: HTMLImageElement): Promise<void> => {
    try {
      const w = img.naturalWidth || img.width || 0
      const h = img.naturalHeight || img.height || 0
      if (!w || !h) return

      let maxDim = 1600
      let maxPixels = 3_000_000
      if (w * h > 40_000_000) {
        maxDim = 1200
        maxPixels = 2_000_000
      }
      let targetW = w
      let targetH = h

      const dim = Math.max(w, h)
      if (dim > maxDim) {
        const ratio = maxDim / dim
        targetW = Math.max(1, Math.round(w * ratio))
        targetH = Math.max(1, Math.round(h * ratio))
      }

      const pixels = targetW * targetH
      if (pixels > maxPixels) {
        const ratio = Math.sqrt(maxPixels / pixels)
        targetW = Math.max(1, Math.floor(targetW * ratio))
        targetH = Math.max(1, Math.floor(targetH * ratio))
      }

      const canvas = document.createElement('canvas')
      canvas.width = targetW
      canvas.height = targetH
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      let bitmap: ImageBitmap | null = null
      try {
        if (typeof createImageBitmap === 'function') {
          bitmap = await createImageBitmap(img, {
            resizeWidth: targetW,
            resizeHeight: targetH,
            resizeQuality: 'high'
          })
        }
      } catch {
        bitmap = null
      }

      if (bitmap) {
        ctx.drawImage(bitmap, 0, 0, targetW, targetH)
        try {
          ;(bitmap as any).close?.()
        } catch {}
      } else {
        ctx.drawImage(img, 0, 0, targetW, targetH)
      }

      const hasAlpha = (() => {
        try {
          const data = ctx.getImageData(0, 0, Math.min(8, targetW), Math.min(8, targetH)).data
          for (let i = 3; i < data.length; i += 4) {
            if (data[i] < 255) return true
          }
        } catch {}
        return false
      })()

      const dataUrl = hasAlpha
        ? canvas.toDataURL('image/png')
        : canvas.toDataURL('image/jpeg', 0.78)

      if (dataUrl && dataUrl.startsWith('data:image/')) {
        await setImageSrcAndWait(img, dataUrl)
      }
    } catch {}
  }

  const replaceImagesWithCanvas = async (root: HTMLElement) => {
    try {
      const imgs = Array.from(root.querySelectorAll('img')) as HTMLImageElement[]
      for (const img of imgs) {
        if ((img as any).dataset?.pdfCanvas === '1') continue

        const rect = img.getBoundingClientRect()
        let targetW = Math.max(1, Math.round(rect.width || img.width || img.naturalWidth || 1))
        let targetH = Math.max(1, Math.round(rect.height || img.height || img.naturalHeight || 1))

        const maxDim = 1600
        const maxPixels = 3_000_000
        const dim = Math.max(targetW, targetH)
        if (dim > maxDim) {
          const ratio = maxDim / dim
          targetW = Math.max(1, Math.round(targetW * ratio))
          targetH = Math.max(1, Math.round(targetH * ratio))
        }
        const pixels = targetW * targetH
        if (pixels > maxPixels) {
          const ratio = Math.sqrt(maxPixels / pixels)
          targetW = Math.max(1, Math.floor(targetW * ratio))
          targetH = Math.max(1, Math.floor(targetH * ratio))
        }

        const canvas = document.createElement('canvas')
        canvas.width = targetW
        canvas.height = targetH
        canvas.className = img.className
        canvas.style.cssText = img.style.cssText
        canvas.style.width = rect.width ? `${rect.width}px` : img.style.width
        canvas.style.height = rect.height ? `${rect.height}px` : img.style.height
        canvas.setAttribute('data-pdf-canvas', '1')

        const ctx = canvas.getContext('2d')
        if (!ctx) continue

        let bitmap: ImageBitmap | null = null
        try {
          if (typeof createImageBitmap === 'function') {
            bitmap = await createImageBitmap(img, {
              resizeWidth: targetW,
              resizeHeight: targetH,
              resizeQuality: 'high'
            })
          }
        } catch {
          bitmap = null
        }

        if (bitmap) {
          ctx.drawImage(bitmap, 0, 0, targetW, targetH)
          try {
            ;(bitmap as any).close?.()
          } catch {}
        } else {
          ctx.drawImage(img, 0, 0, targetW, targetH)
        }

        try {
          img.replaceWith(canvas)
        } catch {
          try {
            img.parentNode?.replaceChild(canvas, img)
          } catch {}
        }
      }
    } catch {}
  }

  const waitForImagesInElement = async (root: HTMLElement, timeoutMs = 8000) => {
    try {
      const imgs = Array.from(root.querySelectorAll('img')) as HTMLImageElement[]
      const pending = imgs.filter((img) => !(img.complete && img.naturalWidth > 0))
      if (!pending.length) {
        await Promise.all(imgs.map(img => compressImageForPdf(img)))
        return Promise.resolve()
      }

      const waitOne = async (img: HTMLImageElement) => {
        try {
          ;(img as any).loading = 'eager'
        } catch {}

        const decodePromise = (() => {
          try {
            const anyImg = img as any
            if (typeof anyImg.decode === 'function') {
              return Promise.resolve(anyImg.decode()).catch(() => {})
            }
          } catch {}
          return null
        })()

        if (decodePromise) {
          return decodePromise.then(async () => {
            await compressImageForPdf(img)
          })
        }

        return new Promise<void>((resolve) => {
          let done = false
          const finish = async () => {
            if (done) return
            done = true
            removeListeners()
            await compressImageForPdf(img)
            resolve()
          }
          const onLoad = () => finish()
          const onError = () => finish()
          const removeListeners = () => {
            try {
              img.removeEventListener('load', onLoad)
              img.removeEventListener('error', onError)
            } catch {}
          }

          try {
            img.addEventListener('load', onLoad)
            img.addEventListener('error', onError)
          } catch {
            resolve()
            return
          }

          // 取りこぼし対策（addEventListener前後でcompleteになっているケース）
          try {
            if (img.complete && img.naturalWidth > 0) {
              finish()
            }
          } catch {}
        })
      }

      const timeout = new Promise<void>((resolve) => {
        window.setTimeout(() => resolve(), timeoutMs)
      })

      return Promise.race([
        Promise.all(pending.map(waitOne)).then(() => {}),
        timeout
      ])
    } catch {
      return Promise.resolve()
    }
  }

  const maxWidthPt = a4.width - marginX * 2
  const maxHeightPt = a4.height - marginY * 2

  let tocPagesEnd = 1

  const buildBodyPages = (root: HTMLElement) => {
    const pageWidthCss = 794
    const pagePaddingCss = 0

    // PDFに貼る時は幅をmaxWidthPtへフィットさせるので、CSS上の高さ上限を幅比で換算
    const maxPageHeightCss = Math.floor((pageWidthCss * maxHeightPt) / maxWidthPt)
    const maxContentHeightCss = Math.max(1, maxPageHeightCss - pagePaddingCss * 2)

    const pagesHost = document.createElement('div')
    pagesHost.style.position = 'fixed'
    pagesHost.style.left = '-100000px'
    pagesHost.style.top = '0'
    pagesHost.style.width = `${pageWidthCss}px`
    pagesHost.style.pointerEvents = 'none'
    pagesHost.setAttribute('aria-hidden', 'true')

    const makePage = () => {
      const page = document.createElement('div')
      page.className = 'doc-frame'
      try {
        page.setAttribute('data-doc-font', baseDocFont)
        page.setAttribute('data-heading-h1', headingStyleH1.value)
        page.setAttribute('data-heading-h2', headingStyleH2.value)
        page.setAttribute('data-heading-h3', headingStyleH3.value)
      } catch {}
      applyHeadingVarsToElement(page)
      page.style.width = `${pageWidthCss}px`
      page.style.background = docBg.value
      page.style.padding = `${pagePaddingCss}px`
      page.style.boxSizing = 'border-box'
      page.style.border = 'none'
      page.style.borderRadius = '0'
      page.style.boxShadow = 'none'
      page.style.color = '#111827'
      page.style.fontFamily = 'system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans JP", "Hiragino Sans", "Yu Gothic", sans-serif'

      const content = document.createElement('div')
      content.className = 'pdf-page-content'
      page.appendChild(content)
      pagesHost.appendChild(page)
      return { page, content }
    }

    const pages: Array<{ page: HTMLElement; content: HTMLElement }> = []
    let current = makePage()
    pages.push(current)

    const nodes = Array.from(root.childNodes)
    nodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const t = (node.textContent || '').trim()
        if (!t) return
      }

      const elNode = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : null
      const isH1 = !!(elNode && elNode.tagName === 'H1')

      // H1は必ず改ページ
      if (isH1 && current.content.childNodes.length > 0) {
        current = makePage()
        pages.push(current)
      }

      current.content.appendChild(node)

      // 収まらないなら次ページへ（要素は割らない）
      if (current.content.scrollHeight > maxContentHeightCss && current.content.childNodes.length > 1) {
        current.content.removeChild(node)
        current = makePage()
        pages.push(current)
        current.content.appendChild(node)
      }
    })

    // floatの回り込みがページをまたがないようクリア
    pages.forEach(({ content }) => {
      const clear = document.createElement('div')
      clear.style.clear = 'both'
      content.appendChild(clear)
    })

    return { pagesHost, pages }
  }

  const renderCanvasWidthFitWithPaging = (
    canvas: HTMLCanvasElement,
    pageStartNumber: number,
    onItem: (info: { pageNumber: number; ratio: number; offsetX: number; offsetY: number; sliceHeightPx: number }) => void
  ) => {
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    if (imgWidth <= 0 || imgHeight <= 0) return { pages: 0, ratio: 1, sliceHeightPx: 0 }

    // ページごとの横幅が変わらないよう、常に「幅フィット」
    const ratio = maxWidthPt / imgWidth
    const renderWidth = imgWidth * ratio
    const offsetX = (a4.width - renderWidth) / 2
    const offsetY = marginY

    const sliceHeightPx = Math.floor(maxHeightPt / ratio)
    if (!Number.isFinite(sliceHeightPx) || sliceHeightPx <= 0) {
      // ページ背景色を設定
      try {
        const bg = docBg.value || '#ffffff'
        const hex = bg.replace('#', '')
        const r = parseInt(hex.substring(0, 2), 16)
        const g = parseInt(hex.substring(2, 4), 16)
        const b = parseInt(hex.substring(4, 6), 16)
        pdf.setFillColor(r, g, b)
        pdf.rect(0, 0, a4.width, a4.height, 'F')
      } catch {}
      const imgData = canvas.toDataURL('image/png')
      pdf.addImage(imgData, 'PNG', offsetX, offsetY, renderWidth, imgHeight * ratio)
      onItem({ pageNumber: pageStartNumber, ratio: typeof ratio !== 'undefined' ? ratio : 1, offsetX, offsetY, sliceHeightPx: imgHeight })
      return { pages: 1, ratio: typeof ratio !== 'undefined' ? ratio : 1, sliceHeightPx: imgHeight }
    }

    if (imgHeight <= sliceHeightPx) {
      // ページ背景色を設定
      try {
        const bg = docBg.value || '#ffffff'
        const hex = bg.replace('#', '')
        const r = parseInt(hex.substring(0, 2), 16)
        const g = parseInt(hex.substring(2, 4), 16)
        const b = parseInt(hex.substring(4, 6), 16)
        pdf.setFillColor(r, g, b)
        pdf.rect(0, 0, a4.width, a4.height, 'F')
      } catch {}
      const imgData = canvas.toDataURL('image/png')
      pdf.addImage(imgData, 'PNG', offsetX, offsetY, renderWidth, imgHeight * ratio)
      onItem({ pageNumber: pageStartNumber, ratio: typeof ratio !== 'undefined' ? ratio : 1, offsetX, offsetY, sliceHeightPx })
      return { pages: 1, ratio: typeof ratio !== 'undefined' ? ratio : 1, sliceHeightPx }
    }

    let yPx = 0
    let pageIndex = 0
    while (yPx < imgHeight) {
      const remaining = imgHeight - yPx
      const thisSlicePx = Math.min(sliceHeightPx, remaining)

      if (pageIndex > 0) pdf.addPage()

      // ページ背景色を設定
      try {
        const bg = docBg.value || '#ffffff'
        const hex = bg.replace('#', '')
        const r = parseInt(hex.substring(0, 2), 16)
        const g = parseInt(hex.substring(2, 4), 16)
        const b = parseInt(hex.substring(4, 6), 16)
        pdf.setFillColor(r, g, b)
        pdf.rect(0, 0, a4.width, a4.height, 'F')
      } catch {}

      const sliceCanvas = document.createElement('canvas')
      sliceCanvas.width = imgWidth
      sliceCanvas.height = thisSlicePx
      const ctx = sliceCanvas.getContext('2d')
      if (!ctx) break

      ctx.drawImage(canvas, 0, yPx, imgWidth, thisSlicePx, 0, 0, imgWidth, thisSlicePx)
      const imgData = sliceCanvas.toDataURL('image/png')
      pdf.addImage(imgData, 'PNG', offsetX, offsetY, renderWidth, thisSlicePx * ratio)

      yPx += thisSlicePx
      pageIndex += 1
    }

      onItem({ pageNumber: pageStartNumber, ratio: typeof ratio !== 'undefined' ? ratio : 1, offsetX, offsetY, sliceHeightPx })
    return { pages: Math.max(1, pageIndex), ratio: typeof ratio !== 'undefined' ? ratio : 1, sliceHeightPx }
  }

  const renderTocToPdf = () => {
    if (!tocRoot) return Promise.resolve()
    return window.html2canvas(tocRoot, renderOptions).then((canvas: HTMLCanvasElement) => {
      addCanvasAsPages(canvas)
      try {
        tocPagesEnd = typeof (pdf as any).getNumberOfPages === 'function' ? (pdf as any).getNumberOfPages() : tocPagesEnd
      } catch {}
    })
  }

  const headingDestByIndex = new Map<number, { pageNumber: number; top: number }>()

  const addTocLinks = () => {
    if (!tocRoot) return
    if (typeof (pdf as any).setPage !== 'function') return
    if (typeof (pdf as any).link !== 'function') return
    if (!tocRowBoxes.length) return
    if (!headingDestByIndex.size) return

    // 目次canvasのページング情報（PDF上のどのページ/座標に行が載るか）
    // html2canvas の canvas は手元にないので、tocRoot の幅(794px)と A4幅の比から近似
    // ただし link の y は tocRoot DOM測定を scale 変換したものを、画像貼り付け時の ratio と同じで換算する
    // ratio は「maxWidth / canvasWidth」なので、canvasWidth は DOM幅 * scale で近似
    const maxWidth = a4.width - marginX * 2
    const maxHeight = a4.height - marginY * 2
    const tocRootWidthCss = Math.max(1, tocRoot.getBoundingClientRect().width)
    const assumedCanvasWidth = Math.max(1, Math.floor(tocRootWidthCss * scale))
    const tocRatio = maxWidth / assumedCanvasWidth
    const sliceHeightPx = Math.floor(maxHeight / tocRatio)
    if (!Number.isFinite(sliceHeightPx) || sliceHeightPx <= 0) return

    const x = marginX
    const w = a4.width - marginX * 2

    tocRowBoxes.forEach((row) => {
      const dest = headingDestByIndex.get(row.index)
      if (!dest) return

      const rowTopPx = row.top * scale
      const rowHeightPx = Math.max(10, row.height * scale)
      const pageIndex = Math.floor(rowTopPx / sliceHeightPx)
      const pageNumber = 1 + pageIndex
      if (pageNumber < 1 || pageNumber > tocPagesEnd) return

      const yInSlicePx = rowTopPx - pageIndex * sliceHeightPx
      const y = marginY + yInSlicePx * tocRatio
      const h = Math.max(10, rowHeightPx * tocRatio)

      try {
        ;(pdf as any).setPage(pageNumber)
        // top が効く環境では該当位置へ、効かない場合でもページジャンプは動く
        ;(pdf as any).link(x, y, w, h, { pageNumber: dest.pageNumber, top: dest.top })
      } catch {}
    })
  }

  const addBodyLinks = () => {
    if (typeof (pdf as any).setPage !== 'function') return
    if (typeof (pdf as any).link !== 'function') return
    if (!bodyLinkAnnos.length) return

    bodyLinkAnnos.forEach((link) => {
      const href = String(link.href || '').trim()
      if (!href) return

      if (href.startsWith('#')) {
        const id = href.slice(1)
        const headingIndex = headingIndexById.get(id)
        if (headingIndex == null) return
        const dest = headingDestByIndex.get(headingIndex)
        if (!dest) return
        try {
          ;(pdf as any).setPage(link.pageNumber)
          ;(pdf as any).link(link.x, link.y, link.w, link.h, { pageNumber: dest.pageNumber, top: dest.top })
        } catch {}
        return
      }

      if (/^https?:\/\//i.test(href) || /^mailto:/i.test(href)) {
        try {
          ;(pdf as any).setPage(link.pageNumber)
          ;(pdf as any).link(link.x, link.y, link.w, link.h, { url: href })
        } catch {}
      }
    })
  }

  Promise.all([
    waitForImagesInElement(printRoot),
    tocRoot ? waitForImagesInElement(tocRoot) : Promise.resolve()
  ]).then(async () => {
    await replaceImagesWithCanvas(printRoot)
    // PDF用: 横溢れによる余白への食い込み/見切れを防ぐ
    applyPdfOverflowGuards(printRoot)
    return renderTocToPdf()
  }).then(() => {
    if (tocRoot) {
      // 目次がある場合は本文を次ページに
      try {
        tocPagesEnd = typeof (pdf as any).getNumberOfPages === 'function' ? (pdf as any).getNumberOfPages() : tocPagesEnd
      } catch {}
      pdf.addPage()
    }

    const bodyStartPageNumber = tocRoot ? (tocPagesEnd + 1) : 1

    const { pagesHost, pages } = buildBodyPages(printRoot)
    document.body.appendChild(pagesHost)

    const run = async () => {
      let currentPageNumber = bodyStartPageNumber
      for (let i = 0; i < pages.length; i += 1) {
        if (i > 0) {
          pdf.addPage()
          currentPageNumber += 1
        }
        const pageStartNumber = currentPageNumber
        const pageEl = pages[i].page

        // このページ内の見出し位置（CSS px）を取得
        const headingTops: Array<{ index: number; topCss: number }> = []
        try {
          const pageRect = pageEl.getBoundingClientRect()
          const heads = Array.from(pageEl.querySelectorAll('h1, h2, h3')) as HTMLElement[]
          heads.forEach((h) => {
            const idxRaw = h.getAttribute('data-heading-index')
            const idx = Number.parseInt(String(idxRaw ?? ''), 10)
            if (!Number.isFinite(idx) || idx < 0) return
            const r = h.getBoundingClientRect()
            headingTops.push({ index: idx, topCss: r.top - pageRect.top })
          })
        } catch {}

        await waitForImagesInElement(pageEl)

        // PDF用: ページごとの横溢れ対策（改ページ後にノードが移動しているので、ここでも適用）
        applyPdfOverflowGuards(pageEl)

        // text-decoration を canvas 化で落とさないための変換
        applyCanvasFriendlyTextDecorations(pageEl)

        // このページ内のリンク位置（CSS px）を取得（canvas化後にPDF座標へ変換して注釈を重ねる）
        const linkBoxes: Array<{ href: string; leftCss: number; topCss: number; widthCss: number; heightCss: number }> = []
        try {
          const pageRect = pageEl.getBoundingClientRect()
          const anchors = Array.from(pageEl.querySelectorAll('a[href]')) as HTMLAnchorElement[]
          anchors.forEach((a) => {
            const href = String(a.getAttribute('href') || '').trim()
            if (!href) return
            const r = a.getBoundingClientRect()
            if (r.width <= 1 || r.height <= 1) return
            linkBoxes.push({
              href,
              leftCss: r.left - pageRect.left,
              topCss: r.top - pageRect.top,
              widthCss: r.width,
              heightCss: r.height
            })
          })
        } catch {}

        const canvas: HTMLCanvasElement = await window.html2canvas(pageEl, renderOptions)

        const meta = {
          ratio: 1,
          offsetX: marginX,
          offsetY: marginY,
          sliceHeightPx: 0
        }

        const rendered = renderCanvasWidthFitWithPaging(canvas, pageStartNumber, (info) => {
          meta.ratio = info.ratio
          meta.offsetX = info.offsetX
          meta.offsetY = info.offsetY
          meta.sliceHeightPx = info.sliceHeightPx
        })

        const ratio = meta.ratio
        const offsetX = meta.offsetX
        const offsetY = meta.offsetY
        const sliceHeightPx = Math.max(1, meta.sliceHeightPx)

        // 目次リンク用に、見出し位置をPDF座標へ
        headingTops.forEach((h) => {
          const topPx = h.topCss * scale
          const pageIndex = Math.floor(topPx / sliceHeightPx)
          const yInSlicePx = topPx - pageIndex * sliceHeightPx
          const topPtRaw = marginY + yInSlicePx * ratio
          const topPt = Math.max(marginY, Math.min(a4.height - marginY, topPtRaw))
          headingDestByIndex.set(h.index, { pageNumber: pageStartNumber + pageIndex, top: topPt })
        })

        // 本文リンク注釈を記録（内部リンク/外部リンク）
        linkBoxes.forEach((b) => {
          const topPx = b.topCss * scale
          const pageIndex = Math.floor(topPx / sliceHeightPx)
          const yInSlicePx = topPx - pageIndex * sliceHeightPx
          const x = offsetX + b.leftCss * scale * ratio
          const y = offsetY + yInSlicePx * ratio
          const w = Math.max(1, b.widthCss * scale * ratio)
          const h = Math.max(1, b.heightCss * scale * ratio)
          bodyLinkAnnos.push({
            pageNumber: pageStartNumber + pageIndex,
            x,
            y,
            w,
            h,
            href: b.href
          })
        })

        // 追加ページが発生した場合は、次のループの開始ページ番号を進める
        if (rendered.pages > 1) {
          currentPageNumber = pageStartNumber + (rendered.pages - 1)
        }
      }
    }

    return run().finally(() => {
      try {
        pagesHost.remove()
      } catch {}
    })
  }).then(() => {
    // 本文を貼った後に、目次ページへリンク注釈を重ねる
    addTocLinks()
    addBodyLinks()
    pdf.save(`${base}.pdf`)
    cleanup()
  }).catch((error) => {
    cleanup()
    alert('PDF生成中にエラーが発生しました。')
  })
}

onMounted(() => {
  loadDocStyle()
  loadRecentColors()

  setThemeCssVar(themeAccent.value)

  const el = editorRef.value
  if (!el) return

  el.innerHTML = props.content
  renderCharacterTokens()
  updateCharacterTokenLabels()
  ensureAccordionStyleAttributes(el)
  appendEmptyTailIfNeeded()
  pushHistoryFromDom()
  updateTocFromDom()
  el.focus()
  captureSelection()

  // 初期ロード後に反映
  persistDocStyle()

  // ポップオーバーの外クリックで閉じる設定
  registerOutsideClose({ isOpen: () => isThemePopoverOpen.value, getHost: () => themeMenuRef.value, onClose: () => { isThemePopoverOpen.value = false } })
  registerOutsideClose({ isOpen: () => isColorPopoverOpen.value, getHost: () => colorMenuRef.value, onClose: () => { isColorPopoverOpen.value = false } })
  registerOutsideClose({ isOpen: () => isLinkPopoverOpen.value, getHost: () => linkMenuRef.value, onClose: () => { isLinkPopoverOpen.value = false } })
  registerOutsideClose({ isOpen: () => isColumnsPopoverOpen.value, getHost: () => columnsMenuRef.value, onClose: () => { isColumnsPopoverOpen.value = false } })
  registerOutsideClose({ isOpen: () => isAccordionPopoverOpen.value, getHost: () => accordionMenuRef.value, onClose: () => { isAccordionPopoverOpen.value = false } })
  registerOutsideClose({ isOpen: () => isTextStylePopoverOpen.value, getHost: () => textStyleMenuRef.value, onClose: () => { isTextStylePopoverOpen.value = false } })
  registerOutsideClose({ isOpen: () => isDividerPopoverOpen.value, getHost: () => dividerMenuRef.value, onClose: () => { isDividerPopoverOpen.value = false } })
  registerOutsideClose({ isOpen: () => isImageWidthPopoverOpen.value, getHost: () => imageWidthMenuRef.value, onClose: () => { isImageWidthPopoverOpen.value = false } })
})

watch(
  () => props.content,
  (val) => {
    if (lastSyncedFromSelf.value === val) {
      lastSyncedFromSelf.value = null
      return
    }
    const el = editorRef.value
    if (!el) return
    if (el.innerHTML !== val) {
      el.innerHTML = val
      renderCharacterTokens()
      ensureAccordionStyleAttributes(el)
      appendEmptyTailIfNeeded()
      pushHistoryFromDom()
      updateTocFromDom()
    }
  }
)

watch(
  () => props.characters,
  () => {
    updateCharacterTokenLabels()

    // セリフ（char-speech）はHTMLとして保持されるので、色変更は content にも反映する
    // （char-token は {{key}} に戻るため、content へは不要）
    const el = editorRef.value
    if (el && el.querySelector('span.char-speech[data-char-key]')) {
      syncFromDom()
    }
  },
  { deep: true }
)

defineExpose({
  insertVariableToken,
  insertCharacterToken,
  insertSpeech,
  replaceCharacterWithPlainText,
  applyImportedDocStyle,
  resetDocStyleToDefaults,
  scrollToHeading,
  downloadHtml,
  downloadPdf,
  downloadJson,
  downloadTxt
})
</script>
