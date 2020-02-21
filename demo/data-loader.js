/**
 * @copyright CEA-LIST/DIASI/SIALV/LVA (2019)
 * @author CEA-LIST/DIASI/SIALV/LVA <pixano@cea.fr>
 * @license CECILL-C
*/

/**
 * Local video cache.
 */
export class VideoCache {

    constructor() {
        this.frames = [];
        this._numFrames = -1;
        this._sourceId = '';
        this._frameIndex = -1;
    }

    get sourceId() {
        return this._sourceId;
    }

    set sourceId(value) {
        this._sourceId = value;
    }

    get frameIndex() {
        return this._frameIndex;
    }

    set frameIndex(frameIndex) {
        this._frameIndex = frameIndex;
    }

    getNextIdxToLoad(start) {
        const idx = this.frames.slice(start + 1).findIndex((f) => f.data == null);
        if (idx !== -1) {
            return start + 1 + idx;
        } else {
            return -1;
        }
    }

    /**
     * Set the total number of frames.
     * @param value total number of frames
     */
    setNumFrames(value) {
        this._numFrames = value;
    }

    /**
     * Get the total number of frames.
     */
    get numFrames() {
        return this._numFrames;
    }

    /**
     * Get the number of currently loaded frames in the cache.
     */
    getNumLoadedFrames() {
        return this.frames.filter((f) => f.data != null).length;
    }

    getLoadedBetween(a, b) {
        return this.frames.slice(a, b).filter((f) => f.data != null).length;
    }

    getMaxLoaded() {
        const revArray = this.frames.slice().reverse();
        const lastIdx = revArray.findIndex((f) => f.data != null);
        return this.frames.length - lastIdx;
    }

    /**
     * Chech if the frames are completly loaded in the cache.
     */
    isFullyLoaded() {
        return ((this.numFrames === this.frames.length) && this.frames.length > 0);
    }

    isLoadedByTimestamp(timestamp) {
        const index = this.frames.findIndex((f) => f.timestamp === timestamp);
        return index !== -1 && this.frames[index].data != null;
    }

    isLoadedByIndex(idx) {
        return this.frames[idx] && this.frames[idx].data != null;
    }

    /**
     * Get image from the cache by id
     * @param id frame id in the cache
     */
    getFrameByIndex(idx) {
        return (this.frames[idx] && this.frames[idx].data != null) ? this.frames[idx].data : null;
    }

    /**
     * Get image from the cache by timestamp
     * @param id frame id in the cache
     */
    getFrameByTimestamp(timestamp) {
        const index = this.frames.findIndex((f) => f.timestamp === timestamp);
        if (index !== -1) {
            return this.frames[index].data;
        }
        return new Image();
    }

    /**
     * Set image from the cache by id
     * @param id frame id in the cache
     */
    setCacheByTimestamp(frame) {
        const index = this.frames.findIndex((f) => f.timestamp === frame.timestamp);
        this.frames[index] = frame;
    }

    /**
     * Get the timestamp for the frame at index.
     * @param id frame index
     */
    toTimestamp(id) {
        return this.frames[id] ? this.frames[id].timestamp : -1;
    }

    /**
     * Get the timestamp for the frame at index.
     * @param id frame index
     */
    getFrameIndex(timestamp) {
        return this.frames.findIndex((f) => f.timestamp === timestamp);
    }

    /**
     * Add new frame to the cache.
     * @param f frame to add
     */
    add(f) {
        this.frames.push(f);
    }

    /**
     * Clear cache.
     */
    clear() {
        this.frames = [];
        this._numFrames = 0;
    }

    clear_data() {
        this.frames.forEach((f) => f.data = null);
    }
}


/**
 * Load video stored as image sequence file.
 */
export class ImageSequenceLoader extends EventTarget {

    constructor() {
        super();
        this.bufferSize = 2500; // number of frames max
        this.loadedFrameNumber = 0;
        this.isLoading = false;
        this.loadStop = false;
        this.cache = null;
        this.frames = [];
        this._eventAbortCompleted = new Event('cancel_completed');
    }

    getIsLoading() {
        return this.isLoading
        //return (this.isLoadingForward || this.isLoadingBackward)
    }

    /**
     * Load metadata
     * @param video
     * @param cache
     */
    init(frames) {
        // fill cache with empty timestamped images to make sure that
        // the timestamps are in order
        this.cache = new VideoCache;
        for (const source of frames) {
            this.cache.add({ timestamp: source.timestamp, data: null });
        }
        this.cache.setNumFrames(frames.length);
        this.frames = frames;
        this.frames.sort((a, b) => {
            return a.timestamp - b.timestamp;
        });
        return Promise.resolve(frames.length);
    }

    getImage(dataUrl) {
        // TODO: check why double
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => {
                resolve(image);
            };
            image.src = dataUrl;
        });
    }

    peekFrame(idx) {
        const requestedFrame = this.cache.getFrameByIndex(idx);
        if (requestedFrame == null) {
            if (this.getIsLoading()) {
              return this.abortLoading().then(() => {
                this.cache.clear_data();
                return this.load(idx); 
              })    
            } else{
              this.cache.clear_data();
              return this.load(idx);
            }
            // if frame not loaded, abort current load and start from there
            //this.videoLoader.setFrameIndex(frameIndex);
        } else {
            return Promise.resolve(requestedFrame);
        }
    }

    /**
     * Cancel image requests by emptying their src
     */
    abortLoading() {
        if (!this.isLoading) {
            return Promise.resolve();
        } else {
            this.loadStop = true;
            const self = this;
            return new Promise(function(resolve, reject) {
                self.addEventListener('cancel_completed', () => {
                    resolve();
                })
            }); 
        }
    }

    /**
     * Launch load of images.
     * Resolve first frame as soon as loaded
     * @param idx first frame index to load
     */
    load(idx, startBufferIdx) {
        startBufferIdx = startBufferIdx || idx;
        const self = this;
        if (!this.frames[idx]) {
            return Promise.resolve();
        }
        let ts = 0;
        try { ts = this.frames[idx].timestamp; 
        } catch(err) {};
        const source = this.frames[idx].url[0];
        const next = idx + 1;
        this.isLoading = true;
        const maxi = Math.min(this.frames.length - 1, startBufferIdx + this.bufferSize - 1)
        if (this.loadStop) {
            this.dispatchEvent(this._eventAbortCompleted)
            this.loadStop = false;
            this.isLoading = false;
        } else {
            return new Promise((resolve, reject) => {
                return this.getImage(source).then((img) => {
                    self.cache.setCacheByTimestamp({ timestamp: ts, data: img });
                    this.dispatchEvent(new CustomEvent('loaded_frame_index', {detail: idx}));
                    if (idx === startBufferIdx) {
                        resolve(img);
                    }
                    if (next <= maxi){
                        self.load(next, startBufferIdx);
                    } else {
                        this.isLoading = false;
                    }                
                });
            });
        }
    }
}

