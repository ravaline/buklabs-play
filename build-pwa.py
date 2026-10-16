# Compatibility wrapper; the portable build runs with Node.js.
from pathlib import Path
import subprocess
subprocess.run(['node',str(Path(__file__).parent/'scripts/build-pwa.mjs')],check=True)
