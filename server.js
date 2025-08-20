import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 5000;

function generateHTML(blog, customMetaTags = [], id) {
    console.log("🚀 ~ generateHTML ~ customMetaTags:", customMetaTags)
    let tags = `
      <title>${blog?.meta_title || blog?.title || "Blog"}</title>
      <meta name="description" content="${blog?.meta_description || ""}">
      <meta name="keywords" content="${blog?.meta_keywords || ""}">
    `;
  
    if (Array.isArray(customMetaTags)) {
      customMetaTags.forEach((tag) => {
        if (tag.type === "property") {
          tags += `<meta property="${tag.key}" content="${tag.content || ""}">`;
        } else if (tag.type === "name") {
          tags += `<meta name="${tag.key}" content="${tag.content || ""}">`;
        }
      });
    }
  
    return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        ${tags}
      </head>
      <body>
        <script>
          window.location.href = "https://develop.realchaininvestments.com/blogs/${id}";
        </script>
      </body>
    </html>`;
  }
  

app.get("/blogs/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // fetch blog from API
    const response = await fetch(`https://api.realchaininvestments.com/api/v1/public/blogs/${id}`);
    const data = await response.json();
    console.log("🚀 ~ data:", data)

    if (!data?.blog) {
      return res.status(404).send("Blog not found");
    }

    const html = generateHTML(data.blog, data.blog.custom_meta_tags || [], id);
    console.log("🚀 ~ html:", html)
    res.send(html);
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).send("Internal Server Error");
  }
});

// fallback for all other routes
app.get("*", (req, res) => {
  res.redirect("https://develop.realchaininvestments.com");
});

app.listen(PORT, () => {
  console.log(`Meta server running at http://localhost:${PORT}`);
});
