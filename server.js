import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 6000;

function generateHTML(blog, customMetaTags = [], id) {
    console.log("🚀 ~ generateHTML ~ customMetaTags:", customMetaTags);
  
    // Default tags map
    const tags = {
      title: blog?.meta_title || blog?.title || "Blog",
      description: blog?.meta_description || "",
      keywords: blog?.meta_keywords || "",
      "og:title": blog?.meta_title || blog?.title || "Blog",
      "og:description": blog?.meta_description || "",
      "og:image": `https://api.realchaininvestments.com/blogs/${blog?.image}` || "https://example.com/default-image.jpg",
      "og:image:width": "1200",
      "og:image:height": "630",
      "og:type": "article",
      "og:url": `https://develop.realchaininvestments.com/blogs/${id}`,
      "og:site_name": "RealChain Investments",
      "twitter:card": "summary_large_image",
      "twitter:title": blog?.meta_title || blog?.title || "Blog",
      "twitter:description": blog?.meta_description || "",
      "twitter:image": `https://api.realchaininvestments.com/blogs/${blog?.image}` || "https://example.com/default-image.jpg",
    };
  
    // Apply custom tags (override defaults if keys match)
    if (Array.isArray(customMetaTags)) {
      customMetaTags.forEach((tag) => {
        if (tag.type === "property" || tag.type === "name") {
          tags[tag.key] = tag.content || "";
        }
      });
    }
  
    // Convert object to HTML tags
    let metaTags = `
      <title>${tags.title}</title>
      <meta name="description" content="${tags.description}">
      <meta name="keywords" content="${tags.keywords}">
    `;
  
    Object.entries(tags).forEach(([key, value]) => {
      if (key === "title" || key === "description" || key === "keywords") return; // already added
      if (key.startsWith("og:")) {
        metaTags += `\n<meta property="${key}" content="${value}">`;
      } else if (key.startsWith("twitter:")) {
        metaTags += `\n<meta name="${key}" content="${value}">`;
      }
    });
  
    return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        ${metaTags}
      </head>
      <body>
        <script>
          window.location.href = "https://realchaininvest.com/blogs/${id}";
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
