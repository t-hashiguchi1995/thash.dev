## Design tokens

このプロジェクトの UI は **CSS カスタムプロパティ（Design Tokens）** を唯一の参照元として実装します。
コンポーネント実装では **ハードコードされた色/フォント/余白値を直接書かず**、必ず `var(--*)` を使用してください。

### Color

- **Primary**: `--color-primary`
- **Primary (hover)**: `--color-primary-hover`
- **Text**: `--color-text`
- **Text (muted)**: `--color-text-muted`
- **Background**: `--color-bg`
- **Surface**: `--color-surface`
- **Border**: `--color-border`

### Typography

- **Sans**: `--font-sans`
- **Weight (regular)**: `--font-weight-regular`
- **Weight (medium)**: `--font-weight-medium`
- **Weight (bold)**: `--font-weight-bold`
- **Text sizes**
  - `--text-xs`
  - `--text-sm`
  - `--text-base`
  - `--text-lg`
  - `--text-xl`

### Spacing

4px スケールを基本にします。

- `--space-1`: 4px
- `--space-2`: 8px
- `--space-3`: 12px
- `--space-4`: 16px
- `--space-5`: 20px
- `--space-6`: 24px
- `--space-8`: 32px
- `--space-10`: 40px
- `--space-12`: 48px
