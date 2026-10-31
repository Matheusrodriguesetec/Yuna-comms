# Imagens da calculadora

Coloque os PNGs com os nomes abaixo. O site escolhe as camadas automaticamente conforme as opções selecionadas; não é necessário editar o JavaScript.

```text
calculadora/
|-- Sketch/
|   |-- personagem.png
|   |-- cores/
|   |   |-- preto-e-branco.png
|   |   `-- colorido.png
|   `-- enquadramento/
|       |-- headshot.png
|       |-- meio-corpo.png
|       `-- corpo-inteiro.png
|-- Lineart/
|   |-- personagem.png
|   |-- cores/
|   |   |-- preto-e-branco.png
|   |   `-- colorido.png
|   `-- enquadramento/
|       |-- headshot.png
|       |-- meio-corpo.png
|       `-- corpo-inteiro.png
`-- cenarios/
    |-- simples/
    |   |-- sem-cor.png
    |   |-- preto-e-branco.png
    |   `-- colorido.png
    `-- detalhado/
        |-- sem-cor.png
        |-- preto-e-branco.png
        `-- colorido.png
```

## Como preparar as camadas

- **`personagem.png`**: desenho-base sem cenário, em PNG com fundo transparente. Faça um arquivo para Sketch e outro para Lineart.
- **`cores/*.png`**: apenas a pintura/sombra da opção correspondente, também transparente e alinhada ao `personagem.png`. O traço fica acima dessa camada. Para **Sem cor**, não é necessário criar uma camada.
- **`enquadramento/*.png`**: apenas o contorno vermelho indicando a área do enquadramento, com o restante transparente. Crie uma imagem para cada opção e salve-a na pasta do estilo correspondente.
- **`cenarios/*.png`**: cenário da opção escolhida, sem o personagem. Essas imagens são compartilhadas por Sketch e Lineart. Para cada tipo de cenário, crie as versões sem cor, em preto e branco e colorida.

Todas as camadas de uma composição devem ter as mesmas dimensões e estar alinhadas na mesma posição. Prefira a proporção 4:5 da área de prévia. Use PNG com transparência. Os nomes de pastas e arquivos diferenciam maiúsculas de minúsculas; mantenha-os exatamente como no exemplo.

Depois de adicionar os arquivos, faça commit e sincronize com o GitHub. A publicação atualiza o site automaticamente.
