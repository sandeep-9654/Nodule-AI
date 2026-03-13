import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Target a 16:9 high resolution viewport for pristine presentation exports
        page = await browser.new_page(viewport={"width": 2560, "height": 1440})
        
        print("Capturing Dashboard (Slide 10)...")
        await page.goto("http://127.0.0.1:3000/")
        await page.wait_for_timeout(2000)
        await page.screenshot(path="slide10.png")

        print("Capturing Analyze Page (Slide 12)...")
        await page.goto("http://127.0.0.1:3000/analyze")
        await page.wait_for_timeout(2000)
        await page.screenshot(path="slide12.png")

        print("Uploading Malignant File & Capturing Visualizer (Slide 13/14)...")
        # Identify the file input and upload exactly what we need
        file_input = page.locator("input[type='file']")
        await file_input.set_input_files("/Users/sandeepraghavendra/Desktop/project/data/Dataset/test_samples/sample_01_malignant.npy")
        
        # Wait for the PyTorch backend to process and the WebGL canvas to start rendering
        print("Waiting for PyTorch inference and WebGL rendering (15s)...")
        await page.wait_for_timeout(15000)
        await page.screenshot(path="slide13_14.png")

        print("Capturing Performance Dashboard (Slide 15)...")
        await page.goto("http://127.0.0.1:3000/performance")
        await page.wait_for_timeout(2000)
        await page.screenshot(path="slide15.png")
        
        print("Capturing Info Page (Slide 16)...")
        await page.goto("http://127.0.0.1:3000/info")
        await page.wait_for_timeout(2000)
        await page.screenshot(path="slide16.png")

        await browser.close()
        print("All screenshots successfully generated!")

if __name__ == "__main__":
    asyncio.run(run())
